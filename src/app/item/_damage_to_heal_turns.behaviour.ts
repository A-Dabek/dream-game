import {addPassiveEffect, condition, duration, heal, onIncomingDamage, turns} from './item.effects';
import {ItemBehavior, ItemEffect} from './item.model';

/**
 * Behavior for the _blueprint_damage_to_heal_turns item.
 * When played, it adds a passive effect that converts all incoming damage into healing for 2 turns.
 */
export class BlueprintDamageToHealTurnsBehaviour implements ItemBehavior {
  whenPlayed(): ItemEffect[] {
    return [
      addPassiveEffect(
        duration(turns(2), condition(onIncomingDamage(), [heal('VALUE_PLACEHOLDER')]))
      ),
    ];
  }
}
