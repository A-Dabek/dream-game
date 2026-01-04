import {computed, signal} from '@angular/core';
import {getItemBehavior, ItemEffect, ItemId, Loadout} from '../item';
import {EngineState} from './engine.model';

type EffectProcessor = (state: EngineState, playerKey: 'playerOne' | 'playerTwo', value: number) => EngineState;

const PROCESSORS: Record<string, EffectProcessor> = {
  damage: (state, playerKey, value) => {
    const opponentKey = playerKey === 'playerOne' ? 'playerTwo' : 'playerOne';
    const multiplier = state[playerKey].damageMultiplier || 1;
    const finalDamage = value * multiplier;
    return {
      ...state,
      [opponentKey]: {
        ...state[opponentKey],
        health: state[opponentKey].health - finalDamage,
      },
    };
  },
  healing: (state, playerKey, value) => ({
    ...state,
    [playerKey]: {
      ...state[playerKey],
      health: state[playerKey].health + value,
    },
  }),
  damageMultiplier: (state, playerKey, value) => ({
    ...state,
    [playerKey]: {
      ...state[playerKey],
      damageMultiplier: state[playerKey].damageMultiplier * value,
    },
  }),
};

export class Engine {
  private readonly engineStateSignal = signal<EngineState>(null!);

  readonly state = computed(() => this.engineStateSignal());

  constructor(playerOne: Loadout & { id: string; damageMultiplier?: number }, playerTwo: Loadout & { id: string; damageMultiplier?: number }) {
    this.engineStateSignal.set({
      playerOne: { damageMultiplier: 1, ...playerOne },
      playerTwo: { damageMultiplier: 1, ...playerTwo },
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

  private processEffect(state: EngineState, playerKey: 'playerOne' | 'playerTwo', effect: ItemEffect): EngineState {
    const processor = PROCESSORS[effect.type];
    return processor ? processor(state, playerKey, effect.value) : state;
  }
}

