import { addStatusEffect, Effect, ItemBehavior, poison } from '../../item';

/**
 * Behavior for the gas_grenade item.
 * Applies poison status effect to both players that deals 1 damage
 * at the end of each turn for 10 turns.
 */
export class GasGrenadeBehaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    const poisonEffect = poison(10);

    return [
      addStatusEffect(poisonEffect, 'self'),
      addStatusEffect(poisonEffect, 'enemy'),
    ];
  }
}
