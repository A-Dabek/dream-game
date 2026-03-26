import {
  EngineLoadout,
  EngineState,
  GameEvent,
  GameEventStatus,
  LifecyclePhase,
} from '../../engine.types';
import { GameEventFactory } from '../../game-event-factory';

export function getTargetKey(
  playerKey: 'playerOne' | 'playerTwo',
  target: 'self' | 'enemy' = 'enemy',
): 'playerOne' | 'playerTwo' {
  if (target === 'self') {
    return playerKey;
  }
  return playerKey === 'playerOne' ? 'playerTwo' : 'playerOne';
}

export function getPlayer(
  state: EngineState,
  playerKey: 'playerOne' | 'playerTwo',
): EngineLoadout {
  return state[playerKey];
}

export function checkGameOver(
  state: EngineState,
  targetKey: 'playerOne' | 'playerTwo',
): GameEvent | null {
  const targetPlayer = getPlayer(state, targetKey);
  if (targetPlayer.health <= 0 && !state.gameOver) {
    const winnerKey = targetKey === 'playerOne' ? 'playerTwo' : 'playerOne';
    const winner = getPlayer(state, winnerKey);
    state.gameOver = true;
    state.winnerId = winner.id;

    return GameEventFactory.createLifecycle(
      winner.id,
      'game_over' as LifecyclePhase,
      [],
      GameEventStatus.DONE,
    );
  }
  return null;
}
