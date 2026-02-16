import { addStatusEffect, invert, turns } from '@dream/item';
import { Effect, ItemBehavior } from '@dream/item';

/**
 * Behavior for the _blueprint_damage_to_heal_turns item.
 * When played, it adds a statusEffect effect that converts all incoming damage into healing for 2 turns.
 */
export class BlueprintDamageToHealTurnsBehaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [addStatusEffect(invert('damage', turns(2)))];
  }
}
