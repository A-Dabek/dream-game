import {Effect, PassiveEffect} from '../../item';
import {EngineState, GameEvent, Listener} from '../engine.model';
import {createCondition, PassiveCondition} from './passive-condition';
import {createDuration, PassiveDuration} from './passive-duration';

export interface PassiveInstance extends Listener {
  readonly effect: PassiveEffect;
}

export class DefaultPassiveInstance implements PassiveInstance {
  constructor(
    readonly instanceId: string,
    readonly playerId: string,
    readonly effect: PassiveEffect,
    private readonly condition: PassiveCondition,
    private readonly duration: PassiveDuration
  ) {}

  static create(
    instanceId: string,
    playerId: string,
    effect: PassiveEffect
  ): DefaultPassiveInstance {
    return new DefaultPassiveInstance(
      instanceId,
      playerId,
      effect,
      createCondition(effect.condition),
      createDuration(effect.duration)
    );
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
    const {modifiedEffect, additionalEffects, nextInstance: postReactionInstance} = this.legacyHandle(event, state);

    let nextEvent: GameEvent | GameEvent[] | void = event;

    if (modifiedEffect !== undefined) {
      if (modifiedEffect === null) {
        nextEvent = undefined;
      } else {
        const actingPlayerId = 'actingPlayerId' in event ? event.actingPlayerId : (event as any).playerId;
        nextEvent = {...modifiedEffect, actingPlayerId};
      }
    }

    if (additionalEffects && additionalEffects.length > 0) {
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

    // 3. Apply lifecycle update (e.g. turn decrement) to the resulting instance
    let finalNextListener: Listener | null = postReactionInstance;
    if (finalNextListener instanceof DefaultPassiveInstance) {
      finalNextListener = finalNextListener.update(event);
    }

    return {
      event: nextEvent,
      nextListener: finalNextListener,
    };
  }

  private shouldReact(event: GameEvent, state: EngineState): boolean {
    return this.condition.shouldReact(event, this.playerId, state);
  }

  private legacyHandle(
    event: GameEvent,
    state: EngineState
  ): {
    modifiedEffect?: Effect | null;
    additionalEffects?: Effect[];
    nextInstance: PassiveInstance | null;
  } {
    let modifiedEffect: Effect | null | undefined;
    let additionalEffects: Effect[] | undefined;

    if (this.condition.type === 'before_effect' && !('playerId' in event)) {
      if (typeof this.effect.action === 'function') {
        modifiedEffect = this.effect.action(event as Effect);
      } else if (!Array.isArray(this.effect.action)) {
        modifiedEffect = this.effect.action;
      }
    } else {
      if (Array.isArray(this.effect.action)) {
        additionalEffects = this.effect.action;
      } else if (typeof this.effect.action === 'object' && !('kind' in this.effect.action)) {
        additionalEffects = [this.effect.action as Effect];
      }
    }

    const nextDuration = this.duration.onHandle();
    const nextInstance = nextDuration
      ? new DefaultPassiveInstance(
          this.instanceId,
          this.playerId,
          this.effect,
          this.condition,
          nextDuration
        )
      : null;

    return {
      modifiedEffect,
      additionalEffects,
      nextInstance,
    };
  }

  private update(event: GameEvent): DefaultPassiveInstance | null {
    const nextDuration = this.duration.update(event, this.playerId);
    if (!nextDuration) return null;
    if (nextDuration === this.duration) return this;
    return new DefaultPassiveInstance(
      this.instanceId,
      this.playerId,
      this.effect,
      this.condition,
      nextDuration
    );
  }
}
