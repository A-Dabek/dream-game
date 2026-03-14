import { GameEvent, GameEventStatus } from '../../engine.types';
import {
  AFTER_EFFECT,
  BEFORE_EFFECT,
  BEFORE_STATUS_EFFECT,
  ON_TURN_END,
  ON_TURN_START,
  ON_PLAY,
} from '../../../item';
import { isEffectEvent, isLifecycleGameEvent } from '../../type-guards';
import { ConditionPredicate } from './reactive-condition';
import { StatusEffect } from '../../../item/item.model';

type Matcher = (event: GameEvent, conditionValue?: unknown) => boolean;

const MATCHERS: Record<string, Matcher> = {
  [ON_TURN_END]: (event) =>
    isLifecycleGameEvent(event) &&
    event.phase === ON_TURN_END &&
    event.status === GameEventStatus.PROGRESS,
  [ON_TURN_START]: (event) =>
    isLifecycleGameEvent(event) &&
    event.phase === ON_TURN_START &&
    event.status === GameEventStatus.PROGRESS,
  [BEFORE_STATUS_EFFECT]: (event, conditionValue) =>
    isEffectEvent(event) &&
    event.effect.type === 'add_status_effect' &&
    (event.effect.value as StatusEffect).type === conditionValue &&
    event.status === GameEventStatus.PROGRESS,
  [BEFORE_EFFECT]: (event, conditionValue) =>
    matchEffectType(event, conditionValue) &&
    event.status === GameEventStatus.PROGRESS,
  [AFTER_EFFECT]: (event, conditionValue) =>
    matchEffectType(event, conditionValue) &&
    event.status === GameEventStatus.DONE,
  [ON_PLAY]: (event) =>
    event.type === 'on_play' && event.status === GameEventStatus.PROGRESS,
};

function matchEffectType(event: GameEvent, conditionValue?: unknown): boolean {
  if (!isEffectEvent(event)) return false;
  return conditionValue === undefined || event.effect.type === conditionValue;
}

export const matchType =
  (expectedType: string, conditionValue?: unknown): ConditionPredicate =>
  (event: GameEvent) => {
    const matcher = MATCHERS[expectedType];
    if (matcher) {
      return matcher(event, conditionValue);
    }

    return (
      event.type === expectedType && event.status === GameEventStatus.PROGRESS
    );
  };
