import { Effect, ItemBehavior } from '../../item';
import { ActiveEffectLibrary, StatusEffectLibrary } from '../../effect-library';
import { charges } from '../../item';

export class BlueprintNegateDamageBehaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [
      ActiveEffectLibrary.add_status_effect(
        StatusEffectLibrary.negate('damage', charges(1)),
      ),
    ];
  }
}
