import {
  AFTER_EFFECT,
  BEFORE_EFFECT,
  Condition,
  Effect,
  HAS_NO_ITEMS,
  ON_PLAY,
  ON_TURN_END,
} from '@dream/item';
import { EngineState, GameEvent } from '../engine.model';
import { isEffectEvent, isLifecycleGameEvent } from '../type-guards';

export interface ReactiveCondition {
  readonly type: string;
  shouldReact(event: GameEvent, playerId: string, state: EngineState): boolean;
}

export type ConditionPredicate = (
  event: GameEvent,
  playerId: string,
  state: EngineState,
) => boolean;

/**
 * Generic implementation of a reactive condition that uses a predicate for logic.
 */
class ComposableCondition implements ReactiveCondition {
  constructor(
    readonly type: string,
    private readonly predicate: ConditionPredicate,
  ) {}

  shouldReact(event: GameEvent, playerId: string, state: EngineState): boolean {
    return this.predicate(event, playerId, state);
  }
}

/**
 * Predicate that matches the event type and optionally its value.
 * Handles BEFORE_EFFECT and AFTER_EFFECT logic.
 */
const matchType =
  (expectedType: string, conditionValue?: unknown): ConditionPredicate =>
  (event) => {
    const lifecycle = isLifecycleGameEvent(event);
    // Special handling for lifecycle phases
    if (expectedType === ON_TURN_END) {
      return lifecycle && event.phase === ON_TURN_END;
    }

    const isEffectType = event.type === 'effect';
    const typeMatches =
      event.type === expectedType ||
      (isEffectType &&
        (expectedType === BEFORE_EFFECT || expectedType === AFTER_EFFECT));

    if (!typeMatches) return false;

    if (conditionValue !== undefined) {
      // Only effect events carry atomic effect type discriminants
      if (isEffectEvent(event)) {
        return event.effect.type === conditionValue;
      }
      return false;
    }

    return true;
  };

/**
 * Predicate that checks if the event was triggered by the player.
 */
const isEventOwner: ConditionPredicate = (event, playerId) =>
  'playerId' in event && event.playerId === playerId;

/**
 * Predicate that checks if the event was NOT triggered by the player.
 */
const isNotEventOwner: ConditionPredicate = (event, playerId) =>
  'playerId' in event && event.playerId !== playerId;

/**
 * Predicate that checks if the player is the target of the effect.
 */
const isTargetMe: ConditionPredicate = (event, playerId) => {
  if (event.type !== 'effect') return false;
  const target = event.effect.target as 'self' | 'enemy' | undefined;
  if (!target) return false;
  const isMe = event.playerId === playerId;
  return target === 'self' ? isMe : !isMe;
};

/**
 * Predicate that checks if the player has no items in their loadout.
 */
const hasNoItems: ConditionPredicate = (event, playerId, state) => {
  const player =
    state.playerOne.id === playerId ? state.playerOne : state.playerTwo;
  return player.items.length === 0;
};

/**
 * Combines multiple predicates with AND logic.
 */
const and =
  (...predicates: ConditionPredicate[]): ConditionPredicate =>
  (event, playerId, state) =>
    predicates.every((p) => p(event, playerId, state));

/**
 * Combines multiple predicates with OR logic.
 */
const or =
  (...predicates: ConditionPredicate[]): ConditionPredicate =>
  (event, playerId, state) =>
    predicates.some((p) => p(event, playerId, state));

/**
 * Negates a predicate.
 */
const not =
  (predicate: ConditionPredicate): ConditionPredicate =>
  (event, playerId, state) =>
    !predicate(event, playerId, state);

class DefaultCondition implements ReactiveCondition {
  readonly type = 'default';
  shouldReact(): boolean {
    return false;
  }
}

export function createCondition(condition: Condition): ReactiveCondition {
  switch (condition.type) {
    case BEFORE_EFFECT:
    case AFTER_EFFECT:
      return new ComposableCondition(
        condition.type,
        and(matchType(condition.type, condition.value), isTargetMe),
      );
    case ON_PLAY:
      return new ComposableCondition(
        ON_PLAY,
        and(matchType(ON_PLAY), isNotEventOwner),
      );
    case ON_TURN_END:
      return new ComposableCondition(
        ON_TURN_END,
        and(matchType(ON_TURN_END), isEventOwner),
      );
    case HAS_NO_ITEMS:
      return new ComposableCondition(HAS_NO_ITEMS, hasNoItems);
    case 'and': {
      const subs = (condition.subConditions || []).map(createCondition);
      return new ComposableCondition(
        subs[0]?.type ?? 'and',
        and(...subs.map((s) => s.shouldReact.bind(s))),
      );
    }
    case 'or': {
      const subs = (condition.subConditions || []).map(createCondition);
      return new ComposableCondition(
        subs[0]?.type ?? 'or',
        or(...subs.map((s) => s.shouldReact.bind(s))),
      );
    }
    case 'not': {
      const sub = condition.subConditions?.[0]
        ? createCondition(condition.subConditions[0])
        : new DefaultCondition();
      return new ComposableCondition(sub.type, not(sub.shouldReact.bind(sub)));
    }
    default:
      return new DefaultCondition();
  }
}
