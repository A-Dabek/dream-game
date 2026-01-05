import {computed, signal} from '@angular/core';
import {Effect, getItemBehavior, ItemEffect, ItemId, Loadout, PassiveEffect, removeItem,} from '../item';
import {DefaultPassiveInstance, PassiveInstance} from './effects';
import {EngineLoadout, EngineState} from './engine.model';
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
      const currentState = this.triggerHandlers(state, playerKey, 'on_play', itemId);

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

  private scanForPassiveEffects(player: EngineLoadout): PassiveInstance[] {
    return player.items.flatMap((item) => {
      const behavior = getItemBehavior(item.id);
      const effects = behavior.passiveEffects?.() ?? [];
      return effects.map(
        (effect) =>
          DefaultPassiveInstance.create(item.instanceId!, player.id, effect)
      );
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
        DefaultPassiveInstance.create(
          `buff-${player.id}-${Date.now()}-${Math.random()}`,
          player.id,
          effect
        ),
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
    const actingPlayerId = state[playerKey].id;

    const passives = [...currentState.passiveEffects];

    for (const pe of passives) {
      if (!currentEffect) break;
      if (!currentState.passiveEffects.find((p) => p.instanceId === pe.instanceId)) continue;

      const event = {type: 'before_effect', actingPlayerId, effect: currentEffect} as any;

      if (pe.shouldReact(event, currentState)) {
        const result = pe.handle(event, currentState);
        currentState = result.state;
        currentEffect = result.modifiedEffect ?? currentEffect;

        const updatedPassives = currentState.passiveEffects
          .map((p) => (p.instanceId === pe.instanceId ? result.newInstance : p))
          .filter((p): p is PassiveInstance => p !== null);
        currentState = {...currentState, passiveEffects: updatedPassives};
      }
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
    const actingPlayerId = state[playerKey].id;

    const event: any = {type: conditionType, actingPlayerId};
    if (conditionType === 'after_effect') {
      event.effect = value;
    } else if (conditionType === 'on_play') {
      event.itemId = value;
    }

    const passives = [...currentState.passiveEffects];

    for (const pe of passives) {
      if (!currentState.passiveEffects.find((p) => p.instanceId === pe.instanceId)) continue;

      if (pe.shouldReact(event, currentState)) {
        const result = pe.handle(event, currentState);
        currentState = result.state;

        const updatedPassives = currentState.passiveEffects
          .map((p) => (p.instanceId === pe.instanceId ? result.newInstance : p))
          .filter((p): p is PassiveInstance => p !== null);
        currentState = {...currentState, passiveEffects: updatedPassives};

        if (result.additionalEffects) {
          const passiveOwnerKey = currentState.playerOne.id === pe.playerId ? 'playerOne' : 'playerTwo';
          currentState = result.additionalEffects.reduce(
            (accState, action) => this.processAtomicEffect(accState, passiveOwnerKey, action, depth + 1),
            currentState
          );
        }
      }
    }

    return currentState;
  }
}

