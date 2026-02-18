import { StatusEffect } from '../../../../item';
import { EngineState, GameEvent } from '../../../engine.types';
import { EffectInstance } from '../../types';
import { BasePassiveInstance } from './base-passive-instance';

export class DefaultPassiveInstance
  extends BasePassiveInstance
  implements EffectInstance
{
  static create(
    instanceId: string,
    playerId: string,
    effect: StatusEffect,
  ): DefaultPassiveInstance {
    return new DefaultPassiveInstance(instanceId, playerId, effect);
  }

  protected handleReaction(
    event: GameEvent,
    state: EngineState,
  ): GameEvent[] | null {
    return this.defaultHandleReaction(event, state);
  }
}
