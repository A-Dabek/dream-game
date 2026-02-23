import { Effect, ItemBehavior } from '../../item';
import { StatusEffectLibrary } from '../../effect-library';

export class BlueprintPassiveAttackBehaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [StatusEffectLibrary.passive_attack(5)];
  }
}
