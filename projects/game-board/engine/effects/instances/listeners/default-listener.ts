import { StatusEffect } from '../../../../item';
import { EngineState, GameEvent } from '../../../engine.types';
import { BaseEffectInstance } from '../base-effect-instance';

export class DefaultListener extends BaseEffectInstance {
  static create(
    instanceId: string,
    playerId: string,
    effect: StatusEffect,
  ): DefaultListener {
    return new DefaultListener(instanceId, playerId, effect);
  }

  protected handleReaction(
    event: GameEvent,
    state: EngineState,
  ): GameEvent[] | null {
    return this.defaultHandleReaction(event, state);
  }
}
