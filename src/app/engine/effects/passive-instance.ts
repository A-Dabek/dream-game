import {Effect, PassiveEffect} from '../../item';
import {EngineState, LifecycleEvent} from '../engine.model';
import {createCondition, PassiveCondition} from './passive-condition';
import {createDuration, PassiveDuration} from './passive-duration';

export interface PassiveInstance {
  readonly instanceId: string;
  readonly playerId: string;
  readonly effect: PassiveEffect;

  shouldReact(event: LifecycleEvent, state: EngineState): boolean;

  handle(
    event: LifecycleEvent,
    state: EngineState
  ): {
    state: EngineState;
    modifiedEffect?: Effect | null;
    additionalEffects?: Effect[];
    newInstance: PassiveInstance | null;
  };

  /**
   * Updates the passive state based on lifecycle events (e.g., decrementing turns at end of turn).
   * This is called even if shouldReact is false.
   */
  update(event: LifecycleEvent): PassiveInstance | null;
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

  shouldReact(event: LifecycleEvent, state: EngineState): boolean {
    return this.condition.shouldReact(event, this.playerId, state);
  }

  handle(
    event: LifecycleEvent,
    state: EngineState
  ): {
    state: EngineState;
    modifiedEffect?: Effect | null;
    additionalEffects?: Effect[];
    newInstance: PassiveInstance | null;
  } {
    let modifiedEffect: Effect | null | undefined;
    let additionalEffects: Effect[] | undefined;

    if (event.type === 'before_effect') {
      if (typeof this.effect.action === 'function') {
        modifiedEffect = this.effect.action(event.effect);
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
    const newInstance = nextDuration
      ? new DefaultPassiveInstance(
          this.instanceId,
          this.playerId,
          this.effect,
          this.condition,
          nextDuration
        )
      : null;

    return {
      state,
      modifiedEffect,
      additionalEffects,
      newInstance,
    };
  }

  update(event: LifecycleEvent): PassiveInstance | null {
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
