export { type Item, type ItemBehavior, type ItemEffect, type ItemId, type Loadout, type PassiveEffect } from './item.model';
export { BlueprintAttackBehaviour } from './_blueprint_attack.behaviour';
export { BlueprintPassiveAttackBehaviour } from './_blueprint_passive_attack.behaviour';
export { BlueprintReactiveRemovalBehaviour } from './_blueprint_reactive_removal.behaviour';
export { BlueprintDamageToHealChargesBehaviour } from './_damage_to_heal_charges.behaviour';
export { BlueprintDamageToHealTurnsBehaviour } from './_damage_to_heal_turns.behaviour';
export { BlueprintDamageToHealPermanentBehaviour } from './_damage_to_heal_permanent.behaviour';
export { attack, heal, passiveAttack, removeItem, removeItemFromOpponent, addPassiveEffect, onIncomingDamage, onDamageTaken, condition, turns, charges, permanent, duration } from './item.effects';
export { getItemBehavior } from './item-registry';
