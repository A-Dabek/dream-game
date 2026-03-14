import { Condition } from './item.model';

export const BEFORE_EFFECT = 'before_effect';
export const AFTER_EFFECT = 'after_effect';
export const BEFORE_STATUS_EFFECT = 'before_status_effect';
export const ON_TURN_START = 'on_turn_start';
export const ON_TURN_END = 'on_turn_end';

export const HAS_NO_ITEMS = 'has_no_items';
export const ON_PLAY = 'on_play';
export const BEFORE_NULLIFY = 'before_nullify';

export const ConditionLibrary = {
  beforeEffect(effectType?: string): Condition {
    return { type: BEFORE_EFFECT, value: effectType };
  },

  beforeStatusEffect(statusEffectType: string): Condition {
    return { type: BEFORE_STATUS_EFFECT, value: statusEffectType };
  },

  afterEffect(effectType?: string): Condition {
    return { type: AFTER_EFFECT, value: effectType };
  },

  onTurnStart(): Condition {
    return { type: ON_TURN_START };
  },

  onTurnEnd(): Condition {
    return { type: ON_TURN_END };
  },

  hasNoItems(): Condition {
    return { type: HAS_NO_ITEMS };
  },

  onPlay(): Condition {
    return { type: ON_PLAY };
  },

  beforeNullify(): Condition {
    return { type: BEFORE_NULLIFY };
  },

  and(...conditions: Condition[]): Condition {
    return { type: 'and', subConditions: conditions };
  },

  or(...conditions: Condition[]): Condition {
    return { type: 'or', subConditions: conditions };
  },

  not(condition: Condition): Condition {
    return { type: 'not', subConditions: [condition] };
  },
} as const;

export function isLifecycleEvent(type: string): boolean {
  // Lifecycle events are now unified under the 'lifecycle' type
  return type === 'lifecycle';
}
