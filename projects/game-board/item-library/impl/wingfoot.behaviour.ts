import { Effect, GAME_CONFIG, ItemBehavior, modifySpeed } from '../../item';

/**
 * Behavior for the wingfoot item.
 * Immediately increases the player's speed by BASE_SPEED_MODIFIER.
 */
export class WingfootBehaviour implements ItemBehavior {
  /**
   * Returns a single speed_up effect targeting self when the item is played.
   */
  whenPlayed(): Effect[] {
    return [modifySpeed(GAME_CONFIG.BASE_SPEED_MODIFIER, 'self')];
  }
}
