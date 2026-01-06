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
  | '_blueprint_status_effect'
  | '_blueprint_negate_damage';

/**
 * Represents an atomic effect that can be applied to the game state.
 */
export interface Effect {
  readonly type: string;
  readonly value: any;
  readonly target?: 'self' | 'enemy';
}

/**
 * Represents a condition that must be met for a passive effect to trigger.
 */
export interface Condition {
  readonly type: string;
  readonly value?: any;
}

/**
 * Represents the duration of a passive effect.
 */
export interface Duration {
  readonly type: 'turns' | 'charges' | 'permanent';
  readonly value?: number;
}

/**
 * Represents a passive effect that reacts to game conditions.
 */
export interface PassiveEffect {
  readonly type?: string;
  readonly condition: Condition;
  readonly action: Effect[];
  readonly duration?: Duration;
}

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
}

/**
 * Represents a player's loadout, including items and base attributes.
 */
export interface Loadout {
  readonly items: Item[];
  readonly health: number;
  readonly speed: number;
}
