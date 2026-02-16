import { attack, GAME_CONFIG } from '@dream/item';
import { Effect, ItemBehavior } from '@dream/item';

/**
 * Behavior for the punch item.
 * Deals baseline damage to the enemy.
 */
export class PunchBehaviour implements ItemBehavior {
  /**
   * Returns a single damage effect equal to BASE_ATTACK when the item is played.
   */
  whenPlayed(): Effect[] {
    return [attack(GAME_CONFIG.BASE_ATTACK)];
  }
}
