import { addStatusEffect, attack, onTurnEnd, statusEffect } from '@dream/item';
import { Effect, ItemBehavior, PassiveEffect } from '@dream/item';

export class TripleThreatBehaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [
      attack(2),
      addStatusEffect(
        statusEffect({
          condition: onTurnEnd(),
          action: [attack(3)],
          duration: { type: 'permanent' },
        }),
      ),
    ];
  }

  passiveEffects(): PassiveEffect[] {
    return [
      statusEffect({
        condition: onTurnEnd(),
        action: [attack(1)],
        duration: { type: 'permanent' },
      }),
    ];
  }
}
