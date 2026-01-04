import {Condition, Duration, ItemEffect, ItemId, PassiveEffect} from './item.model';

/**
 * Creates a damage effect targeting the opponent.
 */
export function attack(value: number | string): ItemEffect {
  return {
    type: 'damage',
    value,
  };
}

/**
 * Creates a healing effect targeting self.
 */
export function heal(value: number | string): ItemEffect {
  return {
    type: 'healing',
    value,
  };
}

/**
 * Creates a passive damage effect that deals damage at the end of the turn.
 */
export function passiveAttack(value: number | string): ItemEffect {
  return {
    type: 'add_passive_attack',
    value,
  };
}

/**
 * Creates an effect that removes an item from the acting player's loadout.
 */
export function removeItem(itemId: ItemId): ItemEffect {
  return {
    type: 'remove_item',
    value: itemId,
  };
}

/**
 * Creates an effect that removes an item from the opponent's loadout.
 */
export function removeItemFromOpponent(itemId: ItemId): ItemEffect {
  return {
    type: 'remove_item_from_opponent',
    value: itemId,
  };
}

/**
 * Creates a condition that triggers when the player takes damage.
 */
export function onDamageTaken(): Condition {
  return { type: 'on_damage_taken' };
}

/**
 * Creates a passive effect from a condition and effects.
 */
export function condition(cond: Condition, effects: ItemEffect | ItemEffect[]): PassiveEffect {
  return {
    condition: cond,
    effects: Array.isArray(effects) ? effects : [effects],
  };
}

/**
 * Creates a condition that triggers before damage is applied.
 */
export function onIncomingDamage(): Condition {
  return { type: 'on_incoming_damage' };
}

/**
 * Creates a duration based on turns.
 */
export function turns(value: number): Duration {
  return { type: 'turns', value };
}

/**
 * Creates a duration based on charges.
 */
export function charges(value: number): Duration {
  return { type: 'charges', value };
}

/**
 * Creates a permanent duration.
 */
export function permanent(): Duration {
  return { type: 'permanent' };
}

/**
 * Adds a duration to a passive effect.
 */
export function duration(dur: Duration, pe: PassiveEffect): PassiveEffect {
  return { ...pe, duration: dur };
}

/**
 * Creates an effect that adds a persistent passive effect to the engine.
 */
export function addPassiveEffect(effect: PassiveEffect): ItemEffect {
  return {
    type: 'add_passive_effect',
    value: effect,
  };
}

