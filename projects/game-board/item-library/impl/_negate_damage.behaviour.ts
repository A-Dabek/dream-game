import {
  addStatusEffect,
  charges,
  Effect,
  ItemBehavior,
  negate,
} from '../../item';

/**
 * Behavior for the _blueprint_negate_damage item.
 * When played, it adds a statusEffect effect that negates the next instance of incoming damage.
 */
export class BlueprintNegateDamageBehaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [addStatusEffect(negate('damage', charges(1)))];
  }
}
