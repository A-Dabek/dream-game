import { BEFORE_EFFECT, StatusEffect } from '../../../item';
import { EngineState, GameEvent, Listener } from '../../engine.types';
import { createCondition, ReactiveCondition } from '../conditions';
import { createDuration, ReactiveDuration } from '../durations';

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

  protected abstract wrapResult(events: GameEvent[]): { event: GameEvent[] };

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

  protected checkRemoveItem(event: GameEvent): GameEvent | null {
    if (
      event.type === 'effect' &&
      event.effect.type === 'remove_item' &&
      event.effect.value === this.instanceId
    ) {
      return {
        type: 'effect',
        effect: {
          type: 'remove_listener',
          value: this.instanceId,
        },
        playerId: this.playerId,
      };
    }
    return null;
  }
}
