import {BlueprintAttackBehaviour} from './_blueprint_attack.behaviour';
import {BlueprintPassiveAttackBehaviour} from './_blueprint_passive_attack.behaviour';
import {ItemBehavior, ItemId} from './item.model';

/**
 * Registry of item behaviors.
 */
const BEHAVIORS: Record<ItemId, new () => ItemBehavior> = {
  _blueprint_attack: BlueprintAttackBehaviour,
  _blueprint_passive_attack: BlueprintPassiveAttackBehaviour,
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
