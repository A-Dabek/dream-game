import { Effect, ItemBehavior } from '../../item';
import { ActiveEffectLibrary } from '../../effect-library';
import { BASE_HEAL } from '../../item';

export class StickingPlasterBehaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [ActiveEffectLibrary.heal(BASE_HEAL)];
  }
}
