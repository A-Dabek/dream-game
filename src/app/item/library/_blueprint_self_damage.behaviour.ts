import {active, selfDamage} from '../item.effects';
import {ItemBehavior, ItemEffect} from '../item.model';

/**
 * Behavior for the _blueprint_self_damage item.
 * This item damages the player that plays it.
 */
export class BlueprintSelfDamageBehaviour implements ItemBehavior {
  /**
   * Returns a self-damage effect when played.
   */
  whenPlayed(): ItemEffect[] {
    return [active(selfDamage(10))];
  }
}
