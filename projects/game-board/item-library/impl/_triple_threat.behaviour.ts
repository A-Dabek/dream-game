import {
  addStatusEffect,
  attack,
  Effect,
  ItemBehavior,
  onTurnEnd,
  PassiveEffect,
  statusEffect,
} from '../../item';

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
