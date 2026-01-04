import {active, addPassiveEffect, beforeEffect, invertDamage, passive, turns} from '../item.effects';
import {ItemBehavior, ItemEffect} from '../item.model';

/**
 * Behavior for the _blueprint_damage_to_heal_turns item.
 * When played, it adds a passive effect that converts all incoming damage into healing for 2 turns.
 */
export class BlueprintDamageToHealTurnsBehaviour implements ItemBehavior {
  whenPlayed(): ItemEffect[] {
    return [
      active(
        addPassiveEffect(
          passive({
            condition: beforeEffect('damage'),
            action: invertDamage(),
            duration: turns(2),
          })
        )
      ),
    ];
  }
}
