import { Effect, StatusEffect } from '../item';
import { ListenerFactory } from './effects';
import { EngineState } from './engine.model';

export type EffectProcessor = (
  state: EngineState,
  playerKey: 'playerOne' | 'playerTwo',
  effect: Effect,
) => EngineState;

function getTargetPlayerKey(
  playerKey: 'playerOne' | 'playerTwo',
  target?: 'self' | 'enemy',
): 'playerOne' | 'playerTwo' {
  if (target === 'self') {
    return playerKey;
  }
  return playerKey === 'playerOne' ? 'playerTwo' : 'playerOne';
}

export const PROCESSORS: Record<string, EffectProcessor> = {
  damage: (state, playerKey, effect) => {
    const targetKey = getTargetPlayerKey(playerKey, effect.target);
    return {
      ...state,
      [targetKey]: {
        ...state[targetKey],
        health: state[targetKey].health - (effect.value as number),
      },
    };
  },
  remove_item: (state, playerKey, effect) => {
    const targetKey = getTargetPlayerKey(playerKey, effect.target);
    const target = state[targetKey];
    const itemIndex = target.items.findIndex(
      (item) => item.instanceId === (effect.value as string),
    );

    if (itemIndex === -1) {
      return state;
    }

    const updatedItems = [...target.items];
    updatedItems.splice(itemIndex, 1);

    return {
      ...state,
      [targetKey]: {
        ...target,
        items: updatedItems,
      },
    };
  },
  remove_listener: (state, playerKey, effect) => {
    const instanceId = effect.value as string;
    const updatedListeners = state.listeners.filter(
      (l) => l.instanceId !== instanceId,
    );
    return {
      ...state,
      listeners: updatedListeners,
    };
  },
  healing: (state, playerKey, effect) => {
    const targetKey = getTargetPlayerKey(playerKey, effect.target);
    return {
      ...state,
      [targetKey]: {
        ...state[targetKey],
        health: state[targetKey].health + (effect.value as number),
      },
    };
  },
  add_status_effect: (state, playerKey, effect) => {
    const targetKey = getTargetPlayerKey(playerKey, effect.target);
    const statusEffect = effect.value as StatusEffect;
    const targetPlayer = state[targetKey];
    return {
      ...state,
      listeners: [
        ListenerFactory.createStatusEffect(
          `buff-${targetPlayer.id}-${Date.now()}-${Math.random()}`,
          targetPlayer.id,
          statusEffect,
        ),
        ...state.listeners,
      ],
    };
  },
};
