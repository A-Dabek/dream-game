import {Condition} from './item.model';

/**
 * Triggered before an effect is applied.
 */
export function beforeEffect(effectType?: string): Condition {
  return { type: 'before_effect', value: effectType };
}

/**
 * Triggered after an effect is applied.
 */
export function afterEffect(effectType?: string): Condition {
  return { type: 'after_effect', value: effectType };
}

/**
 * Triggered when a turn ends.
 */
export function onTurnEnd(): Condition {
  return { type: 'on_turn_end' };
}
