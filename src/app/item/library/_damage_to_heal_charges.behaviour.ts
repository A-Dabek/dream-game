import {addPassiveEffect, charges, invert} from '..';
import {Effect, ItemBehavior} from '../item.model';

/**
 * Behavior for the _blueprint_damage_to_heal_charges item.
 * When played, it adds a passive effect that converts the next 2 instances of damage into healing.
 */
export class BlueprintDamageToHealChargesBehaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [addPassiveEffect(invert('damage', charges(2)))];
  }
}
