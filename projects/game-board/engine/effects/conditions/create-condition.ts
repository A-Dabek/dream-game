import {
  AFTER_EFFECT,
  BEFORE_EFFECT,
  Condition,
  HAS_NO_ITEMS,
  ON_PLAY,
  ON_TURN_END,
} from '../../../item';
import { ReactiveCondition } from './reactive-condition';
import { ComposableCondition } from './composable-condition';
import { DefaultCondition } from './default-condition';
import { matchType } from './match-type';
import { isEventOwner } from './is-event-owner';
import { isNotEventOwner } from './is-not-event-owner';
import { isTargetMe } from './is-target-me';
import { hasNoItems } from './has-no-items';
import { and, or, not } from './combinators';

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
