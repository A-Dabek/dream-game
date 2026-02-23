import { Effect, ItemBehavior } from '../../item';
import { ActiveEffectLibrary } from '../../effect-library';

export class BlueprintSelfDamageBehaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [ActiveEffectLibrary.attack(10, 'self')];
  }
}
