import {Effect, PassiveEffect} from '../../item';
import {EngineState, GameEvent, Listener} from '../engine.model';
import {BasePassiveInstance} from './base-passive-instance';
import {PassiveCondition} from './passive-condition';
import {PassiveDuration} from './passive-duration';

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

  handle(
    event: GameEvent,
    state: EngineState
  ): {
    event: GameEvent | GameEvent[] | void;
    nextListener: Listener | null;
  } {
    // 1. Reaction check first!
    if (!this.shouldReact(event, state)) {
      // No reaction, but still might need lifecycle update (e.g. turn decrement)
      return {
        event,
        nextListener: this.update(event),
      };
    }

    // 2. Handle reaction (this handles things like charges)
    const {nextEvent, postReactionInstance} = this.processReaction(event);

    // 3. Apply lifecycle update (e.g. turn decrement) to the resulting instance
    let finalNextListener: Listener | null = postReactionInstance;
    if (finalNextListener instanceof BasePassiveInstance) {
      finalNextListener = finalNextListener.update(event);
    }

    return {
      event: nextEvent,
      nextListener: finalNextListener,
    };
  }

  protected clone(condition: PassiveCondition, duration: PassiveDuration): this {
    return new DefaultPassiveInstance(
      this.instanceId,
      this.playerId,
      this.effect,
      condition,
      duration
    ) as this;
  }

  private processReaction(event: GameEvent): {
    nextEvent: GameEvent | GameEvent[] | void;
    postReactionInstance: DefaultPassiveInstance | null;
  } {
    let modifiedEffect: Effect | undefined;
    let additionalEffects: Effect[] = [];

    const isBeforeEffect =
      this.condition.type === 'before_effect' &&
      !('type' in event && (event.type === 'on_play' || event.type === 'on_turn_end'));

    if (isBeforeEffect) {
      if (!Array.isArray(this.effect.action)) {
        modifiedEffect = this.effect.action;
      }
    } else {
      if (Array.isArray(this.effect.action)) {
        additionalEffects = this.effect.action;
      } else {
        additionalEffects = [this.effect.action];
      }
    }

    let nextEvent: GameEvent | GameEvent[] | void = event;

    if (modifiedEffect !== undefined) {
      const actingPlayerId =
        'actingPlayerId' in event ? event.actingPlayerId : (event as any).playerId;
      nextEvent = {...modifiedEffect, actingPlayerId};
    }

    if (additionalEffects.length > 0) {
      const mappedAdditions = additionalEffects.map((e) => ({
        ...e,
        actingPlayerId: this.playerId,
      }));
      if (nextEvent === undefined) {
        nextEvent = mappedAdditions;
      } else if (Array.isArray(nextEvent)) {
        nextEvent = [...nextEvent, ...mappedAdditions];
      } else {
        nextEvent = [nextEvent, ...mappedAdditions];
      }
    }

    return {
      nextEvent,
      postReactionInstance: this.onHandle(),
    };
  }
}
