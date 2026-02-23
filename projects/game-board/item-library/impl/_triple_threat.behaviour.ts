import { Effect, ItemBehavior, onTurnEnd, PassiveEffect } from '../../item';
import { ActiveEffectLibrary, StatusEffectLibrary } from '../../effect-library';

export class TripleThreatBehaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [
      ActiveEffectLibrary.attack(2),
      ActiveEffectLibrary.add_status_effect(
        StatusEffectLibrary.status_effect({
          type: '_blueprint_triple_threat',
          condition: onTurnEnd(),
          action: [ActiveEffectLibrary.attack(3)],
          duration: { type: 'permanent' },
        }),
      ),
    ];
  }

  passiveEffects(): PassiveEffect[] {
    return [
      StatusEffectLibrary.status_effect({
        type: '_blueprint_triple_threat',
        condition: onTurnEnd(),
        action: [ActiveEffectLibrary.attack(1)],
        duration: { type: 'permanent' },
      }),
    ];
  }
}
