import { BEFORE_EFFECT, StatusEffect } from '../../../item';
import {
  EngineState,
  GameEvent,
  Listener,
  ListenerData,
} from '../../engine.types';
import { createCondition, ReactiveCondition } from '../conditions';
import { createDuration, ReactiveDuration } from '../durations';
import { ChargesDuration } from '../durations/charges-duration';
import { TurnsDuration } from '../durations/turns-duration';
import { DurationState } from '../types';

function extractDurationState(duration: ReactiveDuration): DurationState {
  switch (duration.type) {
    case 'charges':
      return { type: 'charges', remaining: duration.remaining };
    case 'turns':
      return { type: 'turns', remaining: duration.remaining };
    case 'until_item_removed':
      return { type: 'until_item_removed', remaining: 0 };
    case 'permanent':
    default:
      return { type: 'permanent', remaining: 0 };
  }
}

export abstract class BaseEffectInstance implements Listener {
  protected readonly condition: ReactiveCondition;
  protected readonly duration: ReactiveDuration;

  constructor(protected readonly listenerData: ListenerData) {
    this.condition = createCondition(listenerData.effectState.effect.condition);
    this.duration = createDuration(listenerData.effectState.effect.duration);
    // Sync the runtime state with the duration state if it exists
    this.syncDurationFromState();
  }

  private syncDurationFromState(): void {
    const currentDuration = this.listenerData.effectState.currentDuration;

    if (
      currentDuration.type === 'charges' &&
      this.duration.type === 'charges'
    ) {
      (this.duration as ChargesDuration).remainingCharges =
        currentDuration.remaining;
    } else if (
      currentDuration.type === 'turns' &&
      this.duration.type === 'turns'
    ) {
      (this.duration as TurnsDuration).remainingTurns =
        currentDuration.remaining;
    }
  }

  /**
   * Serializes the listener to ListenerData format.
   */
  serialize(): ListenerData {
    return {
      instanceId: this.listenerData.instanceId,
      playerId: this.listenerData.playerId,
      effectState: {
        effect: this.listenerData.effectState.effect,
        currentDuration: extractDurationState(this.duration),
      },
    };
  }

  get instanceId(): string {
    return this.listenerData.instanceId;
  }

  get playerId(): string {
    return this.listenerData.playerId;
  }

  get effect(): StatusEffect {
    return this.listenerData.effectState.effect;
  }

  handle(event: GameEvent, state: EngineState): { event: GameEvent[] } {
    const reaction = this.handleReaction(event, state);
    const resultEvents = reaction ?? [event];

    if (reaction) {
      this.duration.onHandle();
    }

    this.duration.update(event, this.playerId);

    return this.wrapResult(resultEvents);
  }

  protected abstract handleReaction(
    event: GameEvent,
    state: EngineState,
  ): GameEvent[] | null;

  private wrapResult(events: GameEvent[]): { event: GameEvent[] } {
    const removeSelfEvent = {
      type: 'effect',
      effect: {
        type: 'remove_listener',
        value: this.instanceId,
      },
      playerId: this.playerId,
    } as const;

    // Check if duration expired
    if (this.duration.isExpired) {
      return {
        event: this.addEvent(events, removeSelfEvent),
      };
    }

    // Check if any event removes this listener's associated item
    for (const e of events) {
      if (
        e.type === 'effect' &&
        e.effect.type === 'remove_item' &&
        e.effect.value === this.instanceId
      ) {
        return {
          event: this.addEvent(events, removeSelfEvent),
        };
      }
    }

    return { event: events };
  }

  protected shouldReact(event: GameEvent, state: EngineState): boolean {
    return this.condition.shouldReact(event, this.playerId, state);
  }

  protected defaultHandleReaction(
    event: GameEvent,
    state: EngineState,
  ): GameEvent[] | null {
    if (!this.shouldReact(event, state)) {
      return null;
    }

    const isReplacement =
      this.condition.type === BEFORE_EFFECT && event.type === 'effect';

    if (isReplacement) {
      const playerId = event.playerId;

      return this.effect.action.map((e) => ({
        type: 'effect',
        effect: e,
        playerId,
      }));
    }

    const reactions: GameEvent[] = this.effect.action.map((e) => ({
      type: 'effect',
      effect: e,
      playerId: this.playerId,
    }));

    return [event, ...reactions];
  }

  protected addEvent(base: GameEvent[], newEvent: GameEvent): GameEvent[] {
    if (
      base.some(
        (e) =>
          e.type === 'effect' &&
          e.effect.type === 'remove_listener' &&
          e.effect.value === this.instanceId,
      )
    ) {
      return base;
    }
    return [...base, newEvent];
  }
}
