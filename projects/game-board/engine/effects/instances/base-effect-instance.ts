import {
  AFTER_EFFECT,
  BEFORE_EFFECT,
  BEFORE_NULLIFY,
  BEFORE_STATUS_EFFECT,
  ON_PLAY,
  ON_TURN_END,
  ON_TURN_START,
} from '../../../item';
import {
  EngineState,
  GameEvent,
  GameEventFactory,
  GameEventStatus,
  Listener,
} from '../../engine.model';
import { isLifecycleGameEvent } from '../../type-guards';
import { DurationState, ListenerData } from '../listener-factory';
import { createCondition, ReactiveCondition } from '../conditions';
import { createDuration, ReactiveDuration } from '../durations';
import { ChargesDuration } from '../durations/charges-duration';
import { TurnsDuration } from '../durations/turns-duration';

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
  private syncDurationFromState(
    duration: ReactiveDuration,
    currentDuration: DurationState,
  ): void {
    if (currentDuration.type === 'charges' && duration.type === 'charges') {
      (duration as ChargesDuration).remainingCharges =
        currentDuration.remaining;
    } else if (currentDuration.type === 'turns' && duration.type === 'turns') {
      (duration as TurnsDuration).remainingTurns = currentDuration.remaining;
    }
  }

  canPossiblyReact(event: GameEvent, data: ListenerData): boolean {
    const status = event.status;
    const condition = createCondition(data.effectState.effect.condition);
    const duration = createDuration(data.effectState.effect.duration);
    const type = condition.type;

    // Check if the condition can match this status
    let conditionCanMatch = true;
    switch (type) {
      case BEFORE_EFFECT:
      case BEFORE_STATUS_EFFECT:
      case ON_TURN_START:
      case ON_TURN_END:
      case ON_PLAY:
        if (status !== GameEventStatus.PROGRESS) conditionCanMatch = false;
        break;
      case AFTER_EFFECT:
        if (status !== GameEventStatus.DONE) conditionCanMatch = false;
        break;
      case BEFORE_NULLIFY:
        if (status !== GameEventStatus.NULLIFY) conditionCanMatch = false;
        break;
    }

    if (conditionCanMatch) return true;

    // Even if condition doesn't match, the duration might need an update
    // e.g. a turns-based duration needs on_turn_end events.
    if (
      duration.type === 'turns' &&
      isLifecycleGameEvent(event) &&
      event.phase === 'on_turn_end' &&
      event.playerId === data.playerId &&
      status === GameEventStatus.PROGRESS
    ) {
      return true;
    }

    return false;
  }

  handle(
    event: GameEvent,
    state: EngineState,
    data: ListenerData,
  ): { event: GameEvent[]; data: ListenerData } {
    const condition = createCondition(data.effectState.effect.condition);
    const duration = createDuration(data.effectState.effect.duration);
    this.syncDurationFromState(duration, data.effectState.currentDuration);

    const reaction = this.handleReaction(event, state, data, condition);
    const resultEvents = reaction ?? [event];

    if (reaction) {
      duration.onHandle();
    }

    duration.update(event, data.playerId);

    const updatedData: ListenerData = {
      ...data,
      effectState: {
        ...data.effectState,
        currentDuration: extractDurationState(duration),
      },
    };

    return this.wrapResult(resultEvents, updatedData, duration);
  }

  protected abstract handleReaction(
    event: GameEvent,
    state: EngineState,
    data: ListenerData,
    condition: ReactiveCondition,
  ): GameEvent[] | null;

  private wrapResult(
    events: GameEvent[],
    data: ListenerData,
    duration: ReactiveDuration,
  ): { event: GameEvent[]; data: ListenerData } {
    const removeSelfEvent = GameEventFactory.createEffect(
      data.playerId,
      {
        type: 'remove_listener',
        value: data.instanceId,
      },
      events[0]?.processedBy,
    );

    // Check if duration expired
    if (duration.isExpired) {
      return {
        event: this.addEvent(events, data.instanceId, removeSelfEvent),
        data,
      };
    }

    // Check if any event removes this listener's associated item
    for (const e of events) {
      if (
        e.type === 'effect' &&
        e.effect.type === 'remove_item' &&
        e.effect.value === data.instanceId
      ) {
        return {
          event: this.addEvent(events, data.instanceId, removeSelfEvent),
          data,
        };
      }
    }

    return { event: events, data };
  }

  protected shouldReact(
    event: GameEvent,
    state: EngineState,
    data: ListenerData,
    condition: ReactiveCondition,
  ): boolean {
    return condition.shouldReact(event, data.playerId, state);
  }

  protected defaultHandleReaction(
    event: GameEvent,
    state: EngineState,
    data: ListenerData,
    condition: ReactiveCondition,
  ): GameEvent[] | null {
    if (!this.shouldReact(event, state, data, condition)) {
      return null;
    }

    const isReplacement =
      condition.type === BEFORE_EFFECT && event.type === 'effect';

    if (isReplacement) {
      const playerId = event.playerId;

      return data.effectState.effect.action.map((e) =>
        GameEventFactory.createEffect(playerId, e),
      );
    }

    const reactions: GameEvent[] = data.effectState.effect.action.map((e) =>
      GameEventFactory.createEffect(data.playerId, e),
    );

    return [event, ...reactions];
  }

  protected addEvent(
    base: GameEvent[],
    instanceId: string,
    newEvent: GameEvent,
  ): GameEvent[] {
    if (
      base.some(
        (e) =>
          e.type === 'effect' &&
          e.effect.type === 'remove_listener' &&
          e.effect.value === instanceId,
      )
    ) {
      return base;
    }
    return [...base, newEvent];
  }
}
