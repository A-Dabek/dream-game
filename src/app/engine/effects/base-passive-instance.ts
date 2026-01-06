import {PassiveEffect} from '../../item';
import {EngineState, GameEvent, Listener} from '../engine.model';
import {createCondition, PassiveCondition} from './passive-condition';
import {createDuration, PassiveDuration} from './passive-duration';

/**
 * Base class for passive effect listeners.
 * Handles condition checking, duration updates, and basic state management.
 */
export abstract class BasePassiveInstance implements Listener {
  protected readonly condition: PassiveCondition;
  protected readonly duration: PassiveDuration;

  constructor(
    readonly instanceId: string,
    readonly playerId: string,
    readonly effect: PassiveEffect,
    condition?: PassiveCondition,
    duration?: PassiveDuration
  ) {
    this.condition = condition ?? createCondition(effect.condition);
    this.duration = duration ?? createDuration(effect.duration);
  }

  abstract handle(
    event: GameEvent,
    state: EngineState
  ): {
    event: GameEvent | GameEvent[] | void;
    nextListener: Listener | null;
  };

  public update(event: GameEvent): this | null {
    const nextDuration = this.duration.update(event, this.playerId);
    if (!nextDuration) return null;
    if (nextDuration === this.duration) return this;
    return this.clone(this.condition, nextDuration);
  }

  protected shouldReact(event: GameEvent, state: EngineState): boolean {
    return this.condition.shouldReact(event, this.playerId, state);
  }

  protected onHandle(): this | null {
    const nextDuration = this.duration.onHandle();
    if (!nextDuration) return null;
    return this.clone(this.condition, nextDuration);
  }

  /**
   * Creates a new instance of the listener with updated state.
   * Subclasses must implement this to return their own type.
   */
  protected abstract clone(condition: PassiveCondition, duration: PassiveDuration): this;
}
