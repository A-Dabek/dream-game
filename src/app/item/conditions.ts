import { Condition } from './item.model';

export const BEFORE_EFFECT = 'before_effect';
export const AFTER_EFFECT = 'after_effect';
export const ON_TURN_END = 'on_turn_end';
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
