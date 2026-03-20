import { Effect } from '../../../item';
import { EngineState, GameEvent, GameEventStatus } from '../../engine.types';
import { StateEffectHandler } from '../state-effect-handler.interface';
import { getPlayer } from './utils';

export class RemoveListenerHandler implements StateEffectHandler {
  readonly effectType = 'remove_listener';

  handle(
    state: EngineState,
    playerKey: 'playerOne' | 'playerTwo',
    effect: Effect,
  ): GameEvent {
    const sourcePlayer = getPlayer(state, playerKey);
    const instanceId = effect.value as string;
    state.listeners = state.listeners.filter(
      (l) => l.instanceId !== instanceId,
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
