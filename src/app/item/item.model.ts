/**
 * Represents the genre/type of an item, determining its icon color.
 * Currently only 'basic' is supported, but extensible for future genres.
 */
export type Genre = 'basic';

/**
 * Represents the unique identifier for an item.
 */
export type ItemId =
  | '_blueprint_attack'
  | '_blueprint_passive_attack'
  | '_blueprint_reactive_removal'
  | '_blueprint_damage_to_heal_charges'
  | '_blueprint_damage_to_heal_turns'
  | '_blueprint_damage_to_heal_permanent'
  | '_blueprint_self_damage'
  | '_blueprint_negate_damage'
  | '_blueprint_triple_threat'
  | '_dummy'
  | '_blueprint_heal_5'
  | 'punch'
  | 'sticking_plaster'
  | 'hand'
  | 'sticky_boot'
  | 'wingfoot';

/**
 * Represents the value of an effect, which can be a number (damage/heal amount),
 * string (item ID or effect type), or a StatusEffect configuration.
 */
export type EffectValue = number | string | StatusEffect;

/**
 * Represents an atomic effect that can be applied to the game state.
 */
export interface Effect {
  readonly type: string;
  readonly value: EffectValue;
  readonly target?: 'self' | 'enemy';
}

/**
 * Represents the value of a condition, which can be a string (effect type) or undefined.
 */
export type ConditionValue = string | undefined;

/**
 * Represents a condition that must be met for a status effect to trigger.
 */
export interface Condition {
  readonly type: string;
  readonly value?: ConditionValue;
  readonly subConditions?: Condition[];
}

/**
 * Represents the duration of a status effect.
 */
export interface Duration {
  readonly type: 'turns' | 'charges' | 'permanent';
  readonly value?: number;
}

/**
 * Represents a status effect that reacts to game conditions.
 */
export interface StatusEffect {
  readonly type?: string;
  readonly condition: Condition;
  readonly action: Effect[];
  readonly duration?: Duration;
}

/**
 * Represents a passive effect that is active while the item is in the loadout.
 */
export type PassiveEffect = StatusEffect;

/**
 * Defines the behavior and effects of an item.
 */
export interface ItemBehavior {
  /**
   * Returns the effects to be applied when the item is played.
   */
  whenPlayed(): Effect[];

  /**
   * Returns passive effects that are active while the item is in the loadout.
   */
  passiveEffects?(): PassiveEffect[];
}

/**
 * Represents an item in the game.
 */
export interface Item {
  readonly id: ItemId;
  readonly instanceId?: string;
  readonly genre: Genre;
}

/**
 * Represents a player's loadout, including items and base attributes.
 */
export interface Loadout {
  readonly items: Item[];
  health: number;
  readonly speed: number;
}
