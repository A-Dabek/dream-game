import { Effect, ItemBehavior } from '../item.model';

/**
 * Behavior for the hand item (pass/skip turn).
 * Does nothing when played - essentially a "pass" action implemented as an item.
 */
export class HandBehaviour implements ItemBehavior {
  /**
   * Returns no effects when the item is played.
   */
  whenPlayed(): Effect[] {
    return [];
  }
}
