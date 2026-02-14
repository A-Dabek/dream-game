import { BASE_HEAL, heal } from '@dream/item';
import { Effect, ItemBehavior } from '@dream/item';

/**
 * Behavior for the sticking_plaster item.
 * Heals the player for the calculated BASE_HEAL amount.
 */
export class StickingPlasterBehaviour implements ItemBehavior {
  /**
   * Returns a single healing effect equal to BASE_HEAL when the item is played.
   */
  whenPlayed(): Effect[] {
    return [heal(BASE_HEAL)];
  }
}
