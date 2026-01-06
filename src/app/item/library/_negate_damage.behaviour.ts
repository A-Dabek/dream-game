import {addPassiveEffect, charges, negate} from '..';
import {Effect, ItemBehavior} from '../item.model';

/**
 * Behavior for the _blueprint_negate_damage item.
 * When played, it adds a passive effect that negates the next instance of incoming damage.
 */
export class BlueprintNegateDamageBehaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [addPassiveEffect(negate('damage', charges(1)))];
  }
}
