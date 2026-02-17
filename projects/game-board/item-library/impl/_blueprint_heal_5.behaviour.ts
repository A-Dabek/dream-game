import { Effect, heal, ItemBehavior } from '../../item';

/**
 * Behavior for the _blueprint_heal_5 item.
 * When played, it heals 5 health to the default target (self).
 */
export class BlueprintHeal5Behaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [heal(5)];
  }
}
