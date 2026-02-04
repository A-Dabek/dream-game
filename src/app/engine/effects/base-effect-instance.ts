import { BEFORE_EFFECT, isLifecycleEvent, StatusEffect } from '../../item';
import { EngineState, GameEvent, Listener } from '../engine.model';
import { createCondition, ReactiveCondition } from './reactive-condition';
import { createDuration, ReactiveDuration } from './reactive-duration';

/**
 * Base class for status effect listeners.
 * Handles condition checking, duration updates, and basic state management.
 */
export abstract class BaseEffectInstance implements Listener {
  protected readonly condition: ReactiveCondition;
  protected readonly duration: ReactiveDuration;

  constructor(
    readonly instanceId: string,
    readonly playerId: string,
    readonly effect: StatusEffect,
    condition?: ReactiveCondition,
    duration?: ReactiveDuration,
  ) {
    this.condition = condition ?? createCondition(effect.condition);
    this.duration = duration ?? createDuration(effect.duration);
  }

  /**
   * Main entry point for event processing.
   * Handles the lifecycle of the listener (reaction, charges, duration, removal).
   */
  handle(event: GameEvent, state: EngineState): { event: GameEvent[] } {
    const reaction = this.handleReaction(event, state);
    const resultEvents = reaction ?? [event];

    if (reaction) {
      this.duration.onHandle();
    }

    this.duration.update(event, this.playerId);

    return this.wrapResult(resultEvents);
  }

  /**
   * Subclasses should implement this to define their reaction logic.
   * Return an array of events if the listener reacts, or null if it doesn't.
   */
  protected abstract handleReaction(
    event: GameEvent,
    state: EngineState,
  ): GameEvent[] | null;

  /**
   * Wraps the result events with lifecycle-related events (like removal).
   */
  protected abstract wrapResult(events: GameEvent[]): { event: GameEvent[] };

  protected shouldReact(event: GameEvent, state: EngineState): boolean {
    return this.condition.shouldReact(event, this.playerId, state);
  }

  /**
   * Default reaction logic that either replaces the event (for 'before_effect')
   * or adds new effects to the queue.
   */
  protected defaultHandleReaction(
    event: GameEvent,
    state: EngineState,
  ): GameEvent[] | null {
    if (!this.shouldReact(event, state)) {
      return null;
    }

    const isReplacement =
      this.condition.type === BEFORE_EFFECT && !isLifecycleEvent(event.type);

    if (isReplacement) {
      if (!('playerId' in event && event.playerId)) {
        return null;
      }
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

  protected addEvent(base: GameEvent[], newEvent: GameEvent): GameEvent[] {
    if (
      base.some(
        (e) =>
          e.type === 'remove_listener' && (e as any).value === this.instanceId,
      )
    ) {
      return base;
    }
    return [...base, newEvent];
  }

  protected checkRemoveItem(event: GameEvent): GameEvent | null {
    if (event.type === 'remove_item' && event.value === this.instanceId) {
      return {
        type: 'remove_listener',
        value: this.instanceId,
        playerId: this.playerId,
      };
    }
    return null;
  }
}
