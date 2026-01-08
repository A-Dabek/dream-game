import { Condition } from './item.model';

export const BEFORE_EFFECT = 'before_effect';
export const AFTER_EFFECT = 'after_effect';
export const ON_TURN_END = 'on_turn_end';
export const HAS_NO_ITEMS = 'has_no_items';
export const ON_PLAY = 'on_play';

/**
 * Triggered before an effect is applied.
 */
export function beforeEffect(effectType?: string): Condition {
  return { type: BEFORE_EFFECT, value: effectType };
}

/**
 * Triggered after an effect is applied.
 */
export function afterEffect(effectType?: string): Condition {
  return { type: AFTER_EFFECT, value: effectType };
}

/**
 * Triggered when a turn ends.
 */
export function onTurnEnd(): Condition {
  return { type: ON_TURN_END };
}

/**
 * Checks if the player has no items in their loadout.
 */
export function hasNoItems(): Condition {
  return { type: HAS_NO_ITEMS };
}

/**
 * Triggered when an item is played.
 */
export function onPlay(): Condition {
  return { type: ON_PLAY };
}

/**
 * Checks if the given type is a lifecycle event (cannot be swallowed).
 */
export function isLifecycleEvent(type: string): boolean {
  return type === ON_PLAY || type === ON_TURN_END;
}

/**
 * Combines multiple conditions with AND logic.
 */
export function and(...conditions: Condition[]): Condition {
  return { type: 'and', subConditions: conditions };
}

/**
 * Combines multiple conditions with OR logic.
 */
export function or(...conditions: Condition[]): Condition {
  return { type: 'or', subConditions: conditions };
}

/**
 * Negates a condition.
 */
export function not(condition: Condition): Condition {
  return { type: 'not', subConditions: [condition] };
}
