import {attack} from '..';
import {Effect, ItemBehavior} from '../item.model';

/**
 * Behavior for the _blueprint_attack item.
 */
export class BlueprintAttackBehaviour implements ItemBehavior {
  /**
   * Returns a single damage effect when the item is played.
   */
  whenPlayed(): Effect[] {
    return [attack(10)];
  }
}
