import { Effect, ItemBehavior, charges } from '../../item';
import { ActiveEffectLibrary, StatusEffectLibrary } from '../../effect-library';

export class BlueprintDamageToHealChargesBehaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [
      ActiveEffectLibrary.add_status_effect(
        StatusEffectLibrary.invert('damage', charges(2)),
      ),
    ];
  }
}
