import { AFTER_EFFECT, BEFORE_EFFECT, ON_TURN_END } from '../../../item';
import { GameEvent } from '../../engine.types';
import { isEffectEvent, isLifecycleGameEvent } from '../../type-guards';
import { ConditionPredicate } from './reactive-condition';

export const matchType =
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
