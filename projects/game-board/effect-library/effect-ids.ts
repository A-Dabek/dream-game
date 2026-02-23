/**
 * Unique identifiers for active effects (those that trigger when items are played).
 */
export type ActiveEffectId =
  | 'attack'
  | 'heal'
  | 'modify_speed'
  | 'remove_item'
  | 'add_status_effect';

/**
 * Unique identifiers for status effects (those that linger and react to conditions).
 */
export type StatusEffectId =
  | 'poison'
  | 'invert'
  | 'negate'
  | 'passive_attack'
  | 'status_effect';

/**
 * Combined type for all effect identifiers.
 */
export type EffectId = ActiveEffectId | StatusEffectId;
