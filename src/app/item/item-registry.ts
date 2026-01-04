import {ItemBehavior, ItemId} from './item.model';
import {BlueprintAttackBehaviour} from './library/_blueprint_attack.behaviour';
import {BlueprintPassiveAttackBehaviour} from './library/_blueprint_passive_attack.behaviour';
import {BlueprintReactiveRemovalBehaviour} from './library/_blueprint_reactive_removal.behaviour';
import {BlueprintDamageToHealChargesBehaviour} from './library/_damage_to_heal_charges.behaviour';
import {BlueprintDamageToHealPermanentBehaviour} from './library/_damage_to_heal_permanent.behaviour';
import {BlueprintDamageToHealTurnsBehaviour} from './library/_damage_to_heal_turns.behaviour';

/**
 * Registry of item behaviors.
 */
const BEHAVIORS: Record<ItemId, new () => ItemBehavior> = {
  _blueprint_attack: BlueprintAttackBehaviour,
  _blueprint_passive_attack: BlueprintPassiveAttackBehaviour,
  _blueprint_reactive_removal: BlueprintReactiveRemovalBehaviour,
  _blueprint_damage_to_heal_charges: BlueprintDamageToHealChargesBehaviour,
  _blueprint_damage_to_heal_turns: BlueprintDamageToHealTurnsBehaviour,
  _blueprint_damage_to_heal_permanent: BlueprintDamageToHealPermanentBehaviour,
  _blueprint_status_effect: class implements ItemBehavior {
    whenPlayed() {
      return [];
    }
  },
};

/**
 * Gets the behavior for a given item ID.
 */
export function getItemBehavior(id: ItemId): ItemBehavior {
  const BehaviorClass = BEHAVIORS[id];
  if (!BehaviorClass) {
    throw new Error(`No behavior defined for item ID: ${id}`);
  }
  return new BehaviorClass();
}
