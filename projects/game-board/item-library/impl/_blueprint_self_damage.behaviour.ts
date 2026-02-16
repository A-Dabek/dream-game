import { attack } from '@dream/item';
import { Effect, ItemBehavior } from '@dream/item';

/**
 * Behavior for the _blueprint_self_damage item.
 * This item damages the player that plays it.
 */
export class BlueprintSelfDamageBehaviour implements ItemBehavior {
  /**
   * Returns a self-damage effect when played.
   */
  whenPlayed(): Effect[] {
    return [attack(10, 'self')];
  }
}
