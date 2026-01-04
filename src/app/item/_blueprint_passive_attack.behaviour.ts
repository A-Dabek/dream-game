import {active, passiveAttack} from './item.effects';
import {ItemBehavior, ItemEffect} from './item.model';

/**
 * Behavior for the _blueprint_passive_attack item.
 */
export class BlueprintPassiveAttackBehaviour implements ItemBehavior {
  /**
   * Returns a passive damage effect when the item is played.
   */
  whenPlayed(): ItemEffect[] {
    return [active(passiveAttack(5))];
  }
}
