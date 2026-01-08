import {BEFORE_EFFECT, isLifecycleEvent, StatusEffect} from '../../item';
import {EngineState, GameEvent, Listener} from '../engine.model';
import {BasePassiveInstance} from './base-passive-instance';

export interface PassiveInstance extends Listener {
  readonly effect: StatusEffect;
}

/**
 * Default implementation of a status effect instance.
 * Replaces events for 'before_effect' conditions and adds effects otherwise.
 */
export class DefaultPassiveInstance extends BasePassiveInstance implements PassiveInstance {
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
    if (!this.shouldReact(event, state)) {
      return null;
    }

    const isReplacement = this.condition.type === BEFORE_EFFECT && !isLifecycleEvent(event.type);

    if (isReplacement) {
      const playerId = event.playerId;
      return this.effect.action.map((e) => ({
        ...e,
        playerId,
      }));
    }

    const reactions = this.effect.action.map((e) => ({
      ...e,
      playerId: this.playerId,
    }));

    return [event, ...reactions];
  }
}
