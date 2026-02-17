import {
  addStatusEffect,
  Effect,
  invert,
  ItemBehavior,
  permanent,
} from '../../item';

/**
 * Behavior for the _blueprint_damage_to_heal_permanent item.
 * When played, it adds a statusEffect effect that converts all incoming damage into healing for the rest of the game.
 */
export class BlueprintDamageToHealPermanentBehaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [addStatusEffect(invert('damage', permanent()))];
  }
}
