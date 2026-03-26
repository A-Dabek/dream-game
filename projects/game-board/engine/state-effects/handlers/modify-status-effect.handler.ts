import { Effect } from '../../../item';
import {
  EngineState,
  GameEvent,
  GameEventStatus,
  ModifyStatusEffectPayload,
} from '../../engine.types';
import { StateEffectHandler } from '../state-effect-handler.interface';
import { getPlayer } from './utils';

export class ModifyStatusEffectHandler implements StateEffectHandler {
  readonly effectType = 'modify_status_effect';

  handle(
    state: EngineState,
    playerKey: 'playerOne' | 'playerTwo',
    effect: Effect,
  ): GameEvent {
    const sourcePlayer = getPlayer(state, playerKey);
    const payload = effect.value as unknown as ModifyStatusEffectPayload;
    const listener = state.listeners.find(
      (l) => l.instanceId === payload.instanceId,
    );

    if (!listener) {
      return this.createDoneEvent(sourcePlayer.id, effect);
    }

    if (payload.charges !== undefined) {
      listener.effectState.currentDuration.remaining = payload.charges;
    }

    if (payload.extraParams !== undefined) {
      listener.effectState.effect = {
        ...listener.effectState.effect,
        extraParams: {
          ...(listener.effectState.effect.extraParams || {}),
          ...payload.extraParams,
        },
      };
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
