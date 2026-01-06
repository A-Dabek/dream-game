import {PassiveEffect} from '../../item';
import {EngineState, GameEvent, Listener} from '../engine.model';
import {BasePassiveInstance} from './base-passive-instance';

export interface PassiveInstance extends Listener {
  readonly effect: PassiveEffect;
}

/**
 * Default implementation of a passive effect instance.
 * Replaces events for 'before_effect' conditions and adds effects otherwise.
 */
export class DefaultPassiveInstance extends BasePassiveInstance implements PassiveInstance {
  static create(
    instanceId: string,
    playerId: string,
    effect: PassiveEffect
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

    const isBeforeEffect =
      this.condition.type === 'before_effect' &&
      !('type' in event && (event.type === 'on_play' || event.type === 'on_turn_end'));

    let nextEvent: GameEvent[];

    if (isBeforeEffect) {
      const actingPlayerId =
        'actingPlayerId' in event ? event.actingPlayerId : (event as any).playerId;
      nextEvent = this.effect.action.map((e) => ({
        ...e,
        actingPlayerId,
      }));
    } else {
      const mappedAdditions = this.effect.action.map((e) => ({
        ...e,
        actingPlayerId: this.playerId,
      }));
      nextEvent = [event, ...mappedAdditions];
    }

    return nextEvent;
  }
}
