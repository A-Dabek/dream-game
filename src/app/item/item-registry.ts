import {damageMultiplier} from './item.effects';
import {ItemBehavior, ItemId} from './item.model';
import {SwordBehaviour} from './sword.behaviour';

/**
 * Registry of item behaviors.
 */
const BEHAVIORS: Record<ItemId, new () => ItemBehavior> = {
  sword: SwordBehaviour,
  shield: class implements ItemBehavior { whenPlayed() { return []; } }, // Placeholder
  potion: class implements ItemBehavior { whenPlayed() { return []; } }, // Placeholder
  first: class implements ItemBehavior { whenPlayed() { return []; } }, // Placeholder
  second: class implements ItemBehavior { whenPlayed() { return []; } }, // Placeholder
  third: class implements ItemBehavior { whenPlayed() { return []; } }, // Placeholder
  double: class implements ItemBehavior { whenPlayed() { return [damageMultiplier(2)]; } },
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
