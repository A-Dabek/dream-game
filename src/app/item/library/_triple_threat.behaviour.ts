import {
  addStatusEffect,
  attack,
  Effect,
  ItemBehavior,
  onTurnEnd,
  PassiveEffect,
  permanent,
  statusEffect,
} from '..';

export class TripleThreatBehaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [
      attack(2),
      addStatusEffect(
        statusEffect({
          condition: onTurnEnd(),
          action: [attack(3)],
          duration: permanent(),
        }),
      ),
    ];
  }

  passiveEffects(): PassiveEffect[] {
    return [
      statusEffect({
        condition: onTurnEnd(),
        action: [attack(1)],
        duration: permanent(),
      }),
    ];
  }
}
