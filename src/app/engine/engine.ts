import {computed, signal} from '@angular/core';
import {Effect, getItemBehavior, ItemEffect, ItemId, Loadout, PassiveEffect, removeItem,} from '../item';
import {EngineLoadout, EngineState, RegisteredPassiveEffect} from './engine.model';
import {PROCESSORS} from './processors';

export class Engine {
  private readonly engineStateSignal = signal<EngineState>(null!);

  readonly state = computed(() => this.engineStateSignal());

  constructor(
    playerOne: Loadout & {id: string; endOfTurnEffects?: Effect[]},
    playerTwo: Loadout & {id: string; endOfTurnEffects?: Effect[]}
  ) {
    const p1 = this.prepareLoadout(playerOne);
    const p2 = this.prepareLoadout(playerTwo);

    const passiveEffects = [...this.scanForPassiveEffects(p1), ...this.scanForPassiveEffects(p2)];

    this.engineStateSignal.set({
      playerOne: p1,
      playerTwo: p2,
      passiveEffects,
    });
  }

  play(playerId: string, itemId: ItemId): void {
    const behavior = getItemBehavior(itemId);

    this.engineStateSignal.update((state) => {
      const playerKey = state.playerOne.id === playerId ? 'playerOne' : 'playerTwo';

      // Lifecycle: item is played
      let currentState = this.triggerHandlers(state, playerKey, 'on_play', itemId);

      const effects: ItemEffect[] = [{kind: 'active', action: removeItem(itemId)}, ...behavior.whenPlayed()];

      return effects.reduce(
        (accState, effect) => this.processItemEffect(accState, playerKey, effect),
        currentState
      );
    });
  }

  processEndOfTurn(playerId: string): void {
    this.engineStateSignal.update((state) => {
      const playerKey = state.playerOne.id === playerId ? 'playerOne' : 'playerTwo';
      const player = state[playerKey];

      let nextState = player.endOfTurnEffects.reduce(
        (accState, effect) => this.processAtomicEffect(accState, playerKey, effect),
        state
      );

      // Lifecycle: turn ended
      nextState = this.triggerHandlers(nextState, playerKey, 'on_turn_end');

      return this.processAtomicEffect(nextState, playerKey, {
        type: 'decrement_passive_turns',
        value: playerId,
      });
    });
  }

  private prepareLoadout(loadout: Loadout & {id: string; endOfTurnEffects?: Effect[]}): EngineLoadout {
    return {
      ...loadout,
      endOfTurnEffects: loadout.endOfTurnEffects ?? [],
      items: loadout.items.map((item, index) => ({
        ...item,
        instanceId: item.instanceId ?? `${loadout.id}-${item.id}-${index}`,
      })),
    };
  }

  private scanForPassiveEffects(player: EngineLoadout): RegisteredPassiveEffect[] {
    return player.items.flatMap((item) => {
      const behavior = getItemBehavior(item.id);
      const effects = behavior.passiveEffects?.() ?? [];
      return effects.map((effect) => ({
        playerId: player.id,
        itemId: item.id,
        instanceId: item.instanceId!,
        effect,
        remainingCharges: effect.duration?.type === 'charges' ? effect.duration.value : undefined,
        remainingTurns: effect.duration?.type === 'turns' ? effect.duration.value : undefined,
      }));
    });
  }

  private processItemEffect(
    state: EngineState,
    playerKey: 'playerOne' | 'playerTwo',
    itemEffect: ItemEffect,
    depth = 0
  ): EngineState {
    if (depth > 20) return state;

    if (itemEffect.kind === 'active') {
      return this.processAtomicEffect(state, playerKey, itemEffect.action, depth);
    } else {
      return this.registerPassiveEffect(state, playerKey, itemEffect);
    }
  }

  private registerPassiveEffect(
    state: EngineState,
    playerKey: 'playerOne' | 'playerTwo',
    effect: PassiveEffect
  ): EngineState {
    const player = state[playerKey];
    return {
      ...state,
      passiveEffects: [
        ...state.passiveEffects,
        {
          playerId: player.id,
          itemId: '_blueprint_status_effect',
          instanceId: `buff-${player.id}-${Date.now()}-${Math.random()}`,
          effect,
          remainingCharges: effect.duration?.type === 'charges' ? effect.duration.value : undefined,
          remainingTurns: effect.duration?.type === 'turns' ? effect.duration.value : undefined,
        },
      ],
    };
  }

  private processAtomicEffect(
    state: EngineState,
    playerKey: 'playerOne' | 'playerTwo',
    effect: Effect,
    depth = 0
  ): EngineState {
    if (depth > 20) return state;

    // 1. BEFORE_EFFECT Lifecycle
    let {state: nextState, effect: finalEffect} = this.applyBeforePassives(state, playerKey, effect);

    if (!finalEffect) return nextState;

    // 2. APPLY Effect
    const processor = PROCESSORS[finalEffect.type];
    if (processor) {
      const result = processor(nextState, playerKey, finalEffect.value);
      if (Array.isArray(result)) {
        nextState = result.reduce(
          (accState, nextEffect) => this.processAtomicEffect(accState, playerKey, nextEffect, depth + 1),
          nextState
        );
      } else {
        nextState = result;
      }
    }

    // 3. AFTER_EFFECT Lifecycle
    return this.triggerHandlers(nextState, playerKey, 'after_effect', finalEffect, depth);
  }

  private applyBeforePassives(
    state: EngineState,
    playerKey: 'playerOne' | 'playerTwo',
    effect: Effect
  ): {state: EngineState; effect: Effect | null} {
    let currentEffect: Effect | null = effect;
    let currentState = state;

    // We need to decide which passives apply. Usually it depends on the effect type.
    // For damage, opponent passives apply. For healing, self passives apply.
    const opponentKey = playerKey === 'playerOne' ? 'playerTwo' : 'playerOne';

    const passives = [...currentState.passiveEffects];

    for (const pe of passives) {
      if (!currentEffect) break;

      const isMatchingCondition =
        pe.effect.condition.type === 'before_effect' &&
        (pe.effect.condition.value === undefined || pe.effect.condition.value === currentEffect.type);

      if (!isMatchingCondition) continue;

      // Determine if this passive should trigger based on ownership and effect type
      const isTargetingOwner =
        (currentEffect.type === 'damage' && pe.playerId === currentState[opponentKey].id) ||
        (currentEffect.type === 'healing' && pe.playerId === currentState[playerKey].id);

      if (!isTargetingOwner) continue;

      // Consume usage
      currentState = this.consumePassiveUsage(currentState, pe.instanceId);

      // Apply action
      if (typeof pe.effect.action === 'function') {
        currentEffect = pe.effect.action(currentEffect);
      } else if (!Array.isArray(pe.effect.action)) {
        currentEffect = pe.effect.action;
      }
      // Note: Array of effects in before_effect is not supported for modification, only for triggering (but before_effect is primarily for modification)
    }

    return {state: currentState, effect: currentEffect};
  }

  private triggerHandlers(
    state: EngineState,
    playerKey: 'playerOne' | 'playerTwo',
    conditionType: string,
    value?: any,
    depth = 0
  ): EngineState {
    let currentState = state;
    const opponentKey = playerKey === 'playerOne' ? 'playerTwo' : 'playerOne';

    const passives = [...currentState.passiveEffects];

    for (const pe of passives) {
      const isMatchingCondition =
        pe.effect.condition.type === conditionType &&
        (pe.effect.condition.value === undefined ||
          pe.effect.condition.value === (value && typeof value === 'object' ? value.type : value));

      if (!isMatchingCondition) continue;

      // Filter based on who should react
      let shouldReact = false;
      if (conditionType === 'after_effect') {
        const effect = value as Effect;
        shouldReact =
          (effect.type === 'damage' && pe.playerId === currentState[opponentKey].id) ||
          (effect.type === 'healing' && pe.playerId === currentState[playerKey].id);
      } else if (conditionType === 'on_play') {
        // React to opponent playing something
        shouldReact = pe.playerId === currentState[opponentKey].id;
      } else if (conditionType === 'on_turn_end') {
        // React to own turn ending
        shouldReact = pe.playerId === currentState[playerKey].id;
      }

      if (!shouldReact) continue;

      // Consume usage
      currentState = this.consumePassiveUsage(currentState, pe.instanceId);

      // Trigger actions
      const actions = Array.isArray(pe.effect.action)
        ? pe.effect.action
        : typeof pe.effect.action === 'function'
        ? [] // functions are for modification
        : [pe.effect.action];

      currentState = actions.reduce(
        (accState, action) => this.processAtomicEffect(accState, playerKey, action, depth + 1),
        currentState
      );
    }

    return currentState;
  }

  private consumePassiveUsage(state: EngineState, instanceId: string): EngineState {
    const updatedPassiveEffects = state.passiveEffects
      .map((pe) => {
        if (pe.instanceId === instanceId && pe.remainingCharges !== undefined) {
          return {...pe, remainingCharges: pe.remainingCharges - 1};
        }
        return pe;
      })
      .filter((pe) => pe.remainingCharges === undefined || pe.remainingCharges > 0);

    return {...state, passiveEffects: updatedPassiveEffects};
  }
}

