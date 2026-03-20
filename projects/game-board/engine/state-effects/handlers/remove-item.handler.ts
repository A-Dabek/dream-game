import { Effect } from '../../../item';
import { EngineState, GameEvent, GameEventStatus } from '../../engine.types';
import { StateEffectHandler } from '../state-effect-handler.interface';
import { getTargetKey, getPlayer } from './utils';

export class RemoveItemHandler implements StateEffectHandler {
  readonly effectType = 'remove_item';

  handle(
    state: EngineState,
    playerKey: 'playerOne' | 'playerTwo',
    effect: Effect,
  ): GameEvent {
    const targetKey = getTargetKey(playerKey, effect.target);
    const targetPlayer = getPlayer(state, targetKey);
    const sourcePlayer = getPlayer(state, playerKey);
    const items = targetPlayer.items;
    const instanceId = effect.value as string;
    const updatedItems = items.filter((item) => item.instanceId !== instanceId);
    if (updatedItems.length !== items.length) {
      targetPlayer.items = updatedItems;
    }

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
