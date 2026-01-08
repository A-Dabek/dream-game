import {StatusEffect} from '../../../item';
import {EngineState, GameEvent} from '../../engine.model';
import {EffectInstance} from '../effect-instance';
import {BaseStatusEffectInstance} from './base-status-effect-instance';

/**
 * Specifically for status effects applied to the player (buffs/debuffs).
 * Removed when its duration expires.
 */
export class DefaultStatusEffectInstance extends BaseStatusEffectInstance implements EffectInstance {
  static create(
    instanceId: string,
    playerId: string,
    effect: StatusEffect
  ): DefaultStatusEffectInstance {
    return new DefaultStatusEffectInstance(instanceId, playerId, effect);
  }

  protected handleReaction(
    event: GameEvent,
    state: EngineState
  ): GameEvent[] | null {
    return this.defaultHandleReaction(event, state);
  }
}
