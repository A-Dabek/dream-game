import { Effect, ItemBehavior } from '../../item';
import { ActiveEffectLibrary } from '../../effect-library';

export class BlueprintHeal5Behaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [ActiveEffectLibrary.heal(5)];
  }
}
