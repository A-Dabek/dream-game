import {Effect, ItemId, PassiveEffect} from '../item';
import {ListenerFactory} from './effects';
import {EngineState} from './engine.model';

export type EffectProcessor = (
  state: EngineState,
  playerKey: 'playerOne' | 'playerTwo',
  effect: Effect
) => EngineState;

export const PROCESSORS: Record<string, EffectProcessor> = {
  damage: (state, playerKey, effect) => {
    const targetKey =
      effect.target === 'self'
        ? playerKey
        : playerKey === 'playerOne'
        ? 'playerTwo'
        : 'playerOne';
    return {
      ...state,
      [targetKey]: {
        ...state[targetKey],
        health: state[targetKey].health - (effect.value as number),
      },
    };
  },
  remove_item: (state, playerKey, effect) => {
    const targetKey =
      effect.target === 'enemy' ? (playerKey === 'playerOne' ? 'playerTwo' : 'playerOne') : playerKey;
    const target = state[targetKey];
    const itemIndex = target.items.findIndex((item) => item.id === (effect.value as ItemId));

    if (itemIndex === -1) {
      return state;
    }

    const itemToRemove = target.items[itemIndex];
    const updatedItems = [...target.items];
    updatedItems.splice(itemIndex, 1);

    const updatedListeners = state.listeners.filter(
      (l) => l.instanceId !== itemToRemove.instanceId
    );

    return {
      ...state,
      [targetKey]: {
        ...target,
        items: updatedItems,
      },
      listeners: updatedListeners,
    };
  },
  healing: (state, playerKey, effect) => {
    const targetKey =
      effect.target === 'enemy' ? (playerKey === 'playerOne' ? 'playerTwo' : 'playerOne') : playerKey;
    return {
      ...state,
      [targetKey]: {
        ...state[targetKey],
        health: state[targetKey].health + (effect.value as number),
      },
    };
  },
  add_passive_effect: (state, playerKey, effect) => {
    const targetKey =
      effect.target === 'enemy' ? (playerKey === 'playerOne' ? 'playerTwo' : 'playerOne') : playerKey;
    const passiveEffect = effect.value as PassiveEffect;
    const targetPlayer = state[targetKey];
    return {
      ...state,
      listeners: [
        ListenerFactory.createFromPassive(
          `buff-${targetPlayer.id}-${Date.now()}-${Math.random()}`,
          targetPlayer.id,
          passiveEffect
        ),
        ...state.listeners,
      ],
    };
  },
};
