import { passiveAttack } from '@dream/item';
import { Effect, ItemBehavior } from '@dream/item';

/**
 * Behavior for the _blueprint_passive_attack item.
 */
export class BlueprintPassiveAttackBehaviour implements ItemBehavior {
  /**
   * Returns a status damage effect when the item is played.
   */
  whenPlayed(): Effect[] {
    return [passiveAttack(5)];
  }
}
