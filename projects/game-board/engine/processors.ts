import { StatusEffect } from '../item';
import { TurnManager } from '../turn-manager';
import { createInitialListenerData } from './effects';
import { EngineState, Processors } from './engine.model';

function getTargetKey(
  playerKey: 'playerOne' | 'playerTwo',
  target: 'self' | 'enemy' = 'enemy',
): 'playerOne' | 'playerTwo' {
  if (target === 'self') {
    return playerKey;
  }
  return playerKey === 'playerOne' ? 'playerTwo' : 'playerOne';
}

function updateState(
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

function adjustStat(
  state: EngineState,
  playerKey: 'playerOne' | 'playerTwo',
  stat: 'health' | 'speed',
  delta: number,
  target?: 'self' | 'enemy',
): EngineState {
  const targetKey = getTargetKey(playerKey, target);
  const newValue = (state[targetKey][stat] as number) + delta;
  const updated = updateState(state, targetKey, { [stat]: newValue });
  return stat === 'health' ? checkGameOver(updated, targetKey) : updated;
}

function refreshTurnQueue(state: EngineState): EngineState {
  return {
    ...state,
    turnQueue: TurnManager.recalculateTurnQueue(
      state.playerOne,
      state.playerTwo,
      state.turnQueue,
    ),
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

export const PROCESSORS: Processors = {
  damage: (state, playerKey, effect) =>
    adjustStat(
      state,
      playerKey,
      'health',
      -(effect.value as number),
      effect.target,
    ),
  healing: (state, playerKey, effect) =>
    adjustStat(
      state,
      playerKey,
      'health',
      effect.value as number,
      effect.target,
    ),
  speed_up: (state, playerKey, effect) =>
    refreshTurnQueue(
      adjustStat(
        state,
        playerKey,
        'speed',
        effect.value as number,
        effect.target,
      ),
    ),
  slow_down: (state, playerKey, effect) =>
    refreshTurnQueue(
      adjustStat(
        state,
        playerKey,
        'speed',
        -(effect.value as number),
        effect.target,
      ),
    ),
  remove_item: (state, playerKey, effect) => {
    const targetKey = getTargetKey(playerKey, effect.target);
    const items = state[targetKey].items;
    const instanceId = effect.value as string;
    const updatedItems = items.filter((item) => item.instanceId !== instanceId);
    return updatedItems.length === items.length
      ? state
      : updateState(state, targetKey, { items: updatedItems });
  },
  remove_listener: (state, _, effect) => {
    const instanceId = effect.value as string;
    const updatedListeners = state.listeners.filter(
      (l) => l.instanceId !== instanceId,
    );
    return updatedListeners.length === state.listeners.length
      ? state
      : { ...state, listeners: updatedListeners };
  },
  add_status_effect: (state, playerKey, effect) => {
    const targetKey = getTargetKey(playerKey, effect.target);
    const statusEffect = effect.value as StatusEffect;
    const targetPlayer = state[targetKey];
    return {
      ...state,
      listeners: [
        createInitialListenerData(
          `buff-${targetPlayer.id}-${Date.now()}-${Math.random()}`,
          targetPlayer.id,
          statusEffect,
        ),
        ...state.listeners,
      ],
    };
  },
  advance_turn: (state) => ({
    ...state,
    turnQueue: TurnManager.advanceTurnQueue(
      state.playerOne,
      state.playerTwo,
      state.turnQueue,
      1,
    ),
  }),
};
