import { Effect } from '../../../item';
import { EngineState, GameEvent, GameEventStatus } from '../../engine.types';
import { TurnManager } from '../../../turn-manager';
import { StateEffectHandler } from '../state-effect-handler.interface';
import { getTargetKey, getPlayer } from './utils';

export class SpeedUpHandler implements StateEffectHandler {
  readonly effectType = 'speed_up';

  handle(
    state: EngineState,
    playerKey: 'playerOne' | 'playerTwo',
    effect: Effect,
  ): GameEvent {
    const targetKey = getTargetKey(playerKey, effect.target);
    const targetPlayer = getPlayer(state, targetKey);
    const sourcePlayer = getPlayer(state, playerKey);

    targetPlayer.speed += effect.value as number;

    state.turnQueue = TurnManager.recalculateTurnQueue(
      state.playerOne,
      state.playerTwo,
      state.turnQueue,
    );

    return this.createDoneEvent(sourcePlayer.id, effect);
  }

  private createDoneEvent(playerId: string, effect: Effect): GameEvent {
    return {
      type: 'effect',
      playerId,
      effect,
      processedBy: [],
      status: GameEventStatus.DONE,
    };
  }
}

export class SlowDownHandler implements StateEffectHandler {
  readonly effectType = 'slow_down';

  handle(
    state: EngineState,
    playerKey: 'playerOne' | 'playerTwo',
    effect: Effect,
  ): GameEvent {
    const targetKey = getTargetKey(playerKey, effect.target);
    const targetPlayer = getPlayer(state, targetKey);
    const sourcePlayer = getPlayer(state, playerKey);

    targetPlayer.speed -= effect.value as number;

    state.turnQueue = TurnManager.recalculateTurnQueue(
      state.playerOne,
      state.playerTwo,
      state.turnQueue,
    );

    return this.createDoneEvent(sourcePlayer.id, effect);
  }

  private createDoneEvent(playerId: string, effect: Effect): GameEvent {
    return {
      type: 'effect',
      playerId,
      effect,
      processedBy: [],
      status: GameEventStatus.DONE,
    };
  }
}
