export { type Item, type ItemBehavior, type ItemEffect, type ItemId, type Loadout } from './item.model';
export { BlueprintAttackBehaviour } from './_blueprint_attack.behaviour';
export { BlueprintPassiveAttackBehaviour } from './_blueprint_passive_attack.behaviour';
export { attack, heal, passiveAttack } from './item.effects';
export { getItemBehavior } from './item-registry';
