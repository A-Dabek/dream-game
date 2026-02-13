import { attack } from '../effects';
import { Effect, ItemBehavior } from '../item.model';
import { GAME_CONFIG } from '../game-config';

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
