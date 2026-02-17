import { Effect, GAME_CONFIG, ItemBehavior, modifySpeed } from '../../item';

/**
 * Behavior for the sticky_boot item.
 * Immediately reduces the enemy's speed by BASE_SPEED_MODIFIER.
 */
export class StickyBootBehaviour implements ItemBehavior {
  /**
   * Returns a single slow_down effect targeting the enemy when the item is played.
   */
  whenPlayed(): Effect[] {
    return [modifySpeed(-GAME_CONFIG.BASE_SPEED_MODIFIER, 'enemy')];
  }
}
