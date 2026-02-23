import { Effect, ItemBehavior, permanent } from '../../item';
import { ActiveEffectLibrary, StatusEffectLibrary } from '../../effect-library';

export class BlueprintDamageToHealPermanentBehaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [
      ActiveEffectLibrary.add_status_effect(
        StatusEffectLibrary.invert('damage', permanent()),
      ),
    ];
  }
}
