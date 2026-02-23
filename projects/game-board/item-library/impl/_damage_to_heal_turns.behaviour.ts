import { Effect, ItemBehavior, turns } from '../../item';
import { ActiveEffectLibrary, StatusEffectLibrary } from '../../effect-library';

export class BlueprintDamageToHealTurnsBehaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [
      ActiveEffectLibrary.add_status_effect(
        StatusEffectLibrary.invert('damage', turns(2)),
      ),
    ];
  }
}
