import { Effect, ItemBehavior } from '../../item';
import { ActiveEffectLibrary } from '../../effect-library';

export class BlueprintAttackBehaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [ActiveEffectLibrary.attack(10)];
  }
}
