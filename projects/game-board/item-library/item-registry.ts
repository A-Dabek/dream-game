import { ItemBehavior, ItemId } from '../item';
import {
  BlueprintAttackBehaviour,
  BlueprintHeal5Behaviour,
  BlueprintPassiveAttackBehaviour,
  BlueprintReactiveRemovalBehaviour,
  BlueprintSelfDamageBehaviour,
  BlueprintDamageToHealChargesBehaviour,
  BlueprintDamageToHealPermanentBehaviour,
  BlueprintDamageToHealTurnsBehaviour,
  DummyBehavior,
  BlueprintNegateDamageBehaviour,
  TripleThreatBehaviour,
  HandBehaviour,
  PunchBehaviour,
  StickingPlasterBehaviour,
  StickyBootBehaviour,
  WingfootBehaviour,
} from './impl';

export const BEHAVIORS: Record<ItemId, new () => ItemBehavior> = {
  _blueprint_attack: BlueprintAttackBehaviour,
  _blueprint_heal_5: BlueprintHeal5Behaviour,
  _blueprint_passive_attack: BlueprintPassiveAttackBehaviour,
  _blueprint_reactive_removal: BlueprintReactiveRemovalBehaviour,
  _blueprint_self_damage: BlueprintSelfDamageBehaviour,
  _blueprint_damage_to_heal_charges: BlueprintDamageToHealChargesBehaviour,
  _blueprint_damage_to_heal_permanent: BlueprintDamageToHealPermanentBehaviour,
  _blueprint_damage_to_heal_turns: BlueprintDamageToHealTurnsBehaviour,
  _dummy: DummyBehavior,
  _blueprint_negate_damage: BlueprintNegateDamageBehaviour,
  _blueprint_triple_threat: TripleThreatBehaviour,
  hand: HandBehaviour,
  punch: PunchBehaviour,
  sticking_plaster: StickingPlasterBehaviour,
  sticky_boot: StickyBootBehaviour,
  wingfoot: WingfootBehaviour,
};

export function getItemBehavior(itemId: ItemId): ItemBehavior {
  const BehaviorClass = BEHAVIORS[itemId];
  if (!BehaviorClass) {
    throw new Error(`No behavior found for item: ${itemId}`);
  }
  return new BehaviorClass();
}
