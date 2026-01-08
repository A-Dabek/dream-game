import {StatusEffect} from '../../../item';
import {EngineState, GameEvent} from '../../engine.model';
import {EffectInstance} from '../effect-instance';
import {BasePassiveInstance} from './base-passive-instance';

/**
 * Specifically for passive effects tied to an item.
 * Removed when the item is removed from the loadout.
 */
export class DefaultPassiveInstance extends BasePassiveInstance implements EffectInstance {
  static create(
    instanceId: string,
    playerId: string,
    effect: StatusEffect
  ): DefaultPassiveInstance {
    return new DefaultPassiveInstance(instanceId, playerId, effect);
  }

  protected handleReaction(
    event: GameEvent,
    state: EngineState
  ): GameEvent[] | null {
    return this.defaultHandleReaction(event, state);
  }
}
