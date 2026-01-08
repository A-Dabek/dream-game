import {StatusEffect} from '../../item/item.model';
import {EngineState, GameEvent, Listener} from '../engine.model';
import {createCondition, PassiveCondition} from './passive-condition';
import {createDuration, PassiveDuration} from './passive-duration';

/**
 * Base class for status effect listeners.
 * Handles condition checking, duration updates, and basic state management.
 */
export abstract class BasePassiveInstance implements Listener {
  protected readonly condition: PassiveCondition;
  protected readonly duration: PassiveDuration;

  constructor(
    readonly instanceId: string,
    readonly playerId: string,
    readonly effect: StatusEffect,
    condition?: PassiveCondition,
    duration?: PassiveDuration
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

    return this.wrapResult({ event: resultEvents });
  }

  /**
   * Subclasses should implement this to define their reaction logic.
   * Return an array of events if the listener reacts, or null if it doesn't.
   */
  protected abstract handleReaction(
    event: GameEvent,
    state: EngineState
  ): GameEvent[] | null;

  protected shouldReact(event: GameEvent, state: EngineState): boolean {
    return this.condition.shouldReact(event, this.playerId, state);
  }

  private wrapResult(result: {
    event: GameEvent[];
  }): {
    event: GameEvent[];
  } {
    let finalEvents = result.event;

    // Check for item removal
    for (const e of result.event) {
      const removalEvent = this.checkRemoveItem(e);
      if (removalEvent) {
        finalEvents = this.addEvent(finalEvents, removalEvent);
        break;
      }
    }

    // Check for duration expiration
    if (this.duration.isExpired) {
      const removeEvent: GameEvent = {
        type: 'remove_listener',
        value: this.instanceId,
        playerId: this.playerId,
      };
      finalEvents = this.addEvent(finalEvents, removeEvent);
    }

    return {
      event: finalEvents,
    };
  }

  private addEvent(
    base: GameEvent[],
    newEvent: GameEvent
  ): GameEvent[] {
    if (base.some((e) => e.type === 'remove_listener' && (e as any).value === this.instanceId)) {
      return base;
    }
    return [...base, newEvent];
  }


  private checkRemoveItem(event: GameEvent): GameEvent | null {
    if (event && event.type === 'remove_item' && event.value === this.instanceId) {
      return {
        type: 'remove_listener',
        value: this.instanceId,
        playerId: this.playerId,
      };
    }
    return null;
  }
}
