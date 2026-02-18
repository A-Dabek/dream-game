import { StatusEffect } from '../../../../item';
import { EngineState, GameEvent } from '../../../engine.types';
import { EffectInstance } from '../../types';
import { BaseStatusEffectInstance } from './base-status-effect-instance';

export class DefaultStatusEffectInstance
  extends BaseStatusEffectInstance
  implements EffectInstance
{
  static create(
    instanceId: string,
    playerId: string,
    effect: StatusEffect,
  ): DefaultStatusEffectInstance {
    return new DefaultStatusEffectInstance(instanceId, playerId, effect);
  }

  protected handleReaction(
    event: GameEvent,
    state: EngineState,
  ): GameEvent[] | null {
    return this.defaultHandleReaction(event, state);
  }
}
