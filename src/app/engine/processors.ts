import { Effect, StatusEffect } from '../item';
import { ListenerFactory } from './effects';
import { EngineState } from './engine.model';
import { TurnManager } from './turn-manager/turn-manager';

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

function updatePlayer(
  state: EngineState,
  playerKey: 'playerOne' | 'playerTwo',
  updates: Partial<EngineState['playerOne']>,
): EngineState {
  return {
    ...state,
    [playerKey]: {
      ...state[playerKey],
      ...updates,
    },
  };
}

function getTurnManager(state: EngineState): TurnManager {
  return new TurnManager(
    { id: state.playerOne.id, speed: state.playerOne.speed },
    { id: state.playerTwo.id, speed: state.playerTwo.speed },
    state.turnError,
  );
}

function refreshTurnQueue(state: EngineState): EngineState {
  const tm = getTurnManager(state);
  return {
    ...state,
    turnQueue: tm.getNextTurns(10),
    turnError: tm.accumulatedError,
  };
}

function checkGameOver(
  state: EngineState,
  targetKey: 'playerOne' | 'playerTwo',
): EngineState {
  if (state[targetKey].health <= 0 && !state.gameOver) {
    const winnerKey = targetKey === 'playerOne' ? 'playerTwo' : 'playerOne';
    return {
      ...state,
      gameOver: true,
      winnerId: state[winnerKey].id,
    };
  }
  return state;
}

export const PROCESSORS: Record<string, EffectProcessor> = {
  damage: (state, playerKey, effect) => {
    const targetKey = getTargetPlayerKey(playerKey, effect.target);
    const updatedState = updatePlayer(state, targetKey, {
      health: state[targetKey].health - (effect.value as number),
    });
    return checkGameOver(updatedState, targetKey);
  },
  remove_item: (state, playerKey, effect) => {
    const targetKey = getTargetPlayerKey(playerKey, effect.target);
    const items = state[targetKey].items;
    const instanceId = effect.value as string;
    const updatedItems = items.filter((item) => item.instanceId !== instanceId);
    return updatedItems.length === items.length
      ? state
      : updatePlayer(state, targetKey, { items: updatedItems });
  },
  remove_listener: (state, playerKey, effect) => {
    const instanceId = effect.value as string;
    const updatedListeners = state.listeners.filter(
      (l) => l.instanceId !== instanceId,
    );
    return updatedListeners.length === state.listeners.length
      ? state
      : { ...state, listeners: updatedListeners };
  },
  healing: (state, playerKey, effect) => {
    const targetKey = getTargetPlayerKey(playerKey, effect.target);
    return updatePlayer(state, targetKey, {
      health: state[targetKey].health + (effect.value as number),
    });
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
  advance_turn: (state) => {
    const tm = getTurnManager(state);
    const turnQueue = state.turnQueue.slice(1);
    const needed = 10 - turnQueue.length;

    if (needed > 0) {
      turnQueue.push(...tm.getNextTurns(needed));
    }

    return {
      ...state,
      turnQueue,
      turnError: tm.accumulatedError,
    };
  },
  speed_up: (state, playerKey, effect) => {
    const targetKey = getTargetPlayerKey(playerKey, effect.target);
    const newSpeed = state[targetKey].speed + (effect.value as number);
    return refreshTurnQueue(
      updatePlayer(state, targetKey, { speed: newSpeed }),
    );
  },
  slow_down: (state, playerKey, effect) => {
    const targetKey = getTargetPlayerKey(playerKey, effect.target);
    const newSpeed = state[targetKey].speed - (effect.value as number);
    return refreshTurnQueue(
      updatePlayer(state, targetKey, { speed: newSpeed }),
    );
  },
};
