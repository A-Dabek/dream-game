import { Effect, ItemBehavior } from '../../item';
import { ActiveEffectLibrary, StatusEffectLibrary } from '../../effect-library';

export class GasGrenadeBehaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    const poisonEffect = StatusEffectLibrary.poison(10);

    return [
      ActiveEffectLibrary.add_status_effect(poisonEffect, 'self'),
      ActiveEffectLibrary.add_status_effect(poisonEffect, 'enemy'),
    ];
  }
}
