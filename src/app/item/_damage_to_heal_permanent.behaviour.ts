import {addPassiveEffect, condition, duration, heal, onIncomingDamage, permanent} from './item.effects';
import {ItemBehavior, ItemEffect} from './item.model';

/**
 * Behavior for the _blueprint_damage_to_heal_permanent item.
 * When played, it adds a passive effect that converts all incoming damage into healing for the rest of the game.
 */
export class BlueprintDamageToHealPermanentBehaviour implements ItemBehavior {
  whenPlayed(): ItemEffect[] {
    return [
      addPassiveEffect(
        duration(permanent(), condition(onIncomingDamage(), [heal('VALUE_PLACEHOLDER')]))
      ),
    ];
  }
}
