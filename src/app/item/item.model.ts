/**
 * Represents the unique identifier for an item.
 */
export type ItemId = '_blueprint_attack' | '_blueprint_passive_attack';

/**
 * Represents an effect that an item can have on the game state.
 */
export interface ItemEffect {
  readonly type: string;
  readonly value: number;
}

/**
 * Defines the behavior and effects of an item.
 */
export interface ItemBehavior {
  /**
   * Returns the effects to be applied when the item is played.
   */
  whenPlayed(): ItemEffect[];
}

/**
 * Represents an item in the game.
 */
export interface Item {
  readonly id: ItemId;
}

/**
 * Represents a player's loadout, including items and base attributes.
 */
export interface Loadout {
  readonly items: Item[];
  readonly health: number;
  readonly speed: number;
}
