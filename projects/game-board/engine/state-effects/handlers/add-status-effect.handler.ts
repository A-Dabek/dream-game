import { Effect, StatusEffect } from '../../../item';
import { EngineState, GameEvent, GameEventStatus } from '../../engine.types';
import { GameEventFactory } from '../../game-event-factory';
import { createInitialListenerData } from '../../effects';
import { StateEffectHandler } from '../state-effect-handler.interface';
import { getTargetKey, getPlayer } from './utils';

export class AddStatusEffectHandler implements StateEffectHandler {
  readonly effectType = 'add_status_effect';

  handle(
    state: EngineState,
    playerKey: 'playerOne' | 'playerTwo',
    effect: Effect,
  ): GameEvent {
    const targetKey = getTargetKey(playerKey, effect.target);
    const statusEffect = effect.value as StatusEffect;
    const targetPlayer = getPlayer(state, targetKey);
    const sourcePlayer = getPlayer(state, playerKey);

    const mergeResult = this.mergeStatusEffect(
      state,
      targetPlayer.id,
      statusEffect,
    );
    if (mergeResult) {
      return GameEventFactory.createModifyStatusEffect(
        sourcePlayer.id,
        {
          instanceId: mergeResult.instanceId,
          charges: mergeResult.newCharges,
        },
        [],
        GameEventStatus.DONE,
      );
    }

    const instanceId = `buff-${targetPlayer.id}-${Date.now()}-${Math.random()}`;
    state.listeners.unshift(
      createInitialListenerData(instanceId, targetPlayer.id, statusEffect),
    );

    return this.createDoneEvent(sourcePlayer.id, effect);
  }

  private mergeStatusEffect(
    state: EngineState,
    targetPlayerId: string,
    statusEffect: StatusEffect,
  ): { instanceId: string; newCharges: number } | null {
    if (
      statusEffect.mergeStrategy !== 'increase' ||
      statusEffect.duration?.type !== 'charges'
    ) {
      return null;
    }

    const existingListener = state.listeners.find(
      (listener) =>
        listener.playerId === targetPlayerId &&
        listener.effectState.effect.type === statusEffect.type &&
        listener.effectState.currentDuration.type === 'charges',
    );

    if (!existingListener) {
      return null;
    }

    const incomingCharges = statusEffect.duration.value as number;
    const newCharges =
      existingListener.effectState.currentDuration.remaining + incomingCharges;
    existingListener.effectState.currentDuration.remaining = newCharges;

    return {
      instanceId: existingListener.instanceId,
      newCharges,
    };
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
