/**
 * Represents the unique identifier for an item.
 */
export type ItemId = 'sword' | 'shield' | 'potion' | 'first' | 'second' | 'third';

/**
 * Represents an effect that an item can have on the game state.
 */
export interface ItemEffect {
  readonly type: string;
  readonly value: number;
  readonly target?: 'self' | 'opponent';
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
