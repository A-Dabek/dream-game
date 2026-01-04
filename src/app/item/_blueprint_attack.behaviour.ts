import {attack} from './item.effects';
import {ItemBehavior, ItemEffect} from './item.model';

/**
 * Behavior for the _blueprint_attack item.
 */
export class BlueprintAttackBehaviour implements ItemBehavior {
  /**
   * Returns a single damage effect when the item is played.
   */
  whenPlayed(): ItemEffect[] {
    return [attack(10)];
  }
}
