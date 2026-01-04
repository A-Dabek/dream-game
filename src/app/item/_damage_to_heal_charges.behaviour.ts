import {addPassiveEffect, charges, condition, duration, heal, onIncomingDamage} from './item.effects';
import {ItemBehavior, ItemEffect} from './item.model';

/**
 * Behavior for the _blueprint_damage_to_heal_charges item.
 * When played, it adds a passive effect that converts the next 2 instances of damage into healing.
 */
export class BlueprintDamageToHealChargesBehaviour implements ItemBehavior {
  whenPlayed(): ItemEffect[] {
    return [
      addPassiveEffect(
        duration(charges(2), condition(onIncomingDamage(), [heal('VALUE_PLACEHOLDER')]))
      ),
    ];
  }
}
