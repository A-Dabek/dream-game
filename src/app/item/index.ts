export { type Item, type ItemBehavior, type ItemEffect, type ItemId, type Loadout, type PassiveEffect } from './item.model';
export { BlueprintAttackBehaviour } from './_blueprint_attack.behaviour';
export { BlueprintPassiveAttackBehaviour } from './_blueprint_passive_attack.behaviour';
export { BlueprintReactiveRemovalBehaviour } from './_blueprint_reactive_removal.behaviour';
export { attack, heal, passiveAttack, removeItem, removeItemFromOpponent } from './item.effects';
export { getItemBehavior } from './item-registry';
