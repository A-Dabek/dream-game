import { Effect } from '../../../item';
import { EngineState, GameEvent, GameEventStatus } from '../../engine.types';
import { TurnManager } from '../../../turn-manager';
import { StateEffectHandler } from '../state-effect-handler.interface';
import { getPlayer } from './utils';

export class AdvanceTurnHandler implements StateEffectHandler {
  readonly effectType = 'advance_turn';

  handle(
    state: EngineState,
    playerKey: 'playerOne' | 'playerTwo',
    effect: Effect,
  ): GameEvent {
    const sourcePlayer = getPlayer(state, playerKey);

    state.turnQueue = TurnManager.advanceTurnQueue(
      state.playerOne,
      state.playerTwo,
      state.turnQueue,
      1,
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
