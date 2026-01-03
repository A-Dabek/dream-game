import {attack} from './item.effects';
import {ItemBehavior, ItemEffect} from './item.model';

/**
 * Behavior for the Sword item.
 */
export class SwordBehaviour implements ItemBehavior {
  /**
   * Returns a single damage effect when the sword is played.
   */
  whenPlayed(): ItemEffect[] {
    return [attack(10)];
  }
}
