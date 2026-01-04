import {computed, signal} from '@angular/core';
import {getItemBehavior, ItemEffect, ItemId, Loadout, removeItem} from '../item';
import {EngineLoadout, EngineState, RegisteredPassiveEffect} from './engine.model';
import {PROCESSORS} from './processors';

export class Engine {
  private readonly engineStateSignal = signal<EngineState>(null!);

  readonly state = computed(() => this.engineStateSignal());

  constructor(
    playerOne: Loadout & { id: string; endOfTurnEffects?: ItemEffect[] },
    playerTwo: Loadout & { id: string; endOfTurnEffects?: ItemEffect[] }
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
    const effects = [removeItem(itemId), ...behavior.whenPlayed()];

    this.engineStateSignal.update((state) => {
      const playerKey = state.playerOne.id === playerId ? 'playerOne' : 'playerTwo';

      return effects.reduce(
        (currentState, effect) => this.processEffect(currentState, playerKey, effect),
        state
      );
    });
  }

  processEndOfTurn(playerId: string): void {
    this.engineStateSignal.update((state) => {
      const playerKey = state.playerOne.id === playerId ? 'playerOne' : 'playerTwo';
      const player = state[playerKey];

      return player.endOfTurnEffects.reduce(
        (currentState, effect) => this.processEffect(currentState, playerKey, effect),
        state
      );
    });
  }

  private prepareLoadout(
    loadout: Loadout & { id: string; endOfTurnEffects?: ItemEffect[] }
  ): EngineLoadout {
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
      }));
    });
  }

  private processEffect(
    state: EngineState,
    playerKey: 'playerOne' | 'playerTwo',
    effect: ItemEffect
  ): EngineState {
    const processor = PROCESSORS[effect.type];
    if (!processor) return state;

    const result = processor(state, playerKey, effect.value);
    if (Array.isArray(result)) {
      return result.reduce(
        (currentState, nextEffect) => this.processEffect(currentState, playerKey, nextEffect),
        state
      );
    }
    return result;
  }
}

