import {computed, signal} from '@angular/core';
import {getItemBehavior, ItemEffect, ItemId, Loadout} from '../item';
import {EngineState} from './engine.model';
import {PROCESSORS} from './processors';

export class Engine {
  private readonly engineStateSignal = signal<EngineState>(null!);

  readonly state = computed(() => this.engineStateSignal());

  constructor(
    playerOne: Loadout & { id: string; endOfTurnEffects?: ItemEffect[] },
    playerTwo: Loadout & { id: string; endOfTurnEffects?: ItemEffect[] }
  ) {
    this.engineStateSignal.set({
      playerOne: { endOfTurnEffects: [], ...playerOne },
      playerTwo: { endOfTurnEffects: [], ...playerTwo },
    });
  }

  play(playerId: string, itemId: ItemId): void {
    const behavior = getItemBehavior(itemId);
    const effects = behavior.whenPlayed();

    this.engineStateSignal.update((state) => {
      const playerKey = state.playerOne.id === playerId ? 'playerOne' : 'playerTwo';
      const player = state[playerKey];

      // Remove the played item from inventory
      const itemIndex = player.items.findIndex((item) => item.id === itemId);
      const updatedItems = [...player.items];
      if (itemIndex !== -1) {
        updatedItems.splice(itemIndex, 1);
      }

      const stateWithRemovedItem = {
        ...state,
        [playerKey]: {
          ...player,
          items: updatedItems,
        },
      };

      return effects.reduce(
        (currentState, effect) => this.processEffect(currentState, playerKey, effect),
        stateWithRemovedItem
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

