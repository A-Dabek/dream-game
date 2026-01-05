import {ActiveEffect, Condition, Duration, Effect, ItemId, PassiveEffect,} from './item.model';

/**
 * Creates a damage effect targeting the opponent.
 */
export function attack(value: number | string): Effect {
  return {
    type: 'damage',
    value,
    target: 'enemy',
  };
}

/**
 * Creates a damage effect targeting self.
 */
export function selfDamage(value: number | string): Effect {
  return {
    type: 'damage',
    value,
    target: 'self',
  };
}

/**
 * Creates a healing effect targeting self.
 */
export function heal(value: number | string): Effect {
  return {
    type: 'healing',
    value,
    target: 'self',
  };
}

/**
 * Creates a passive damage effect that deals damage at the end of the turn.
 */
export function passiveAttack(value: number | string): Effect {
  return {
    type: 'add_passive_attack',
    value,
    target: 'self',
  };
}

/**
 * Creates an effect that removes an item from the acting player's loadout.
 */
export function removeItem(itemId: ItemId): Effect {
  return {
    type: 'remove_item',
    value: itemId,
    target: 'self',
  };
}

/**
 * Creates an effect that removes an item from the opponent's loadout.
 */
export function removeItemFromOpponent(itemId: ItemId): Effect {
  return {
    type: 'remove_item',
    value: itemId,
    target: 'enemy',
  };
}

/**
 * Creates a condition that triggers when the player takes damage.
 */
export function onDamageTaken(): Condition {
  return afterEffect('damage');
}

/**
 * Creates a condition that triggers before damage is applied.
 */
export function onIncomingDamage(): Condition {
  return beforeEffect('damage');
}

/**
 * Triggered when an item is played.
 */
export function onPlay(): Condition {
  return { type: 'on_play' };
}

/**
 * Triggered before an effect is applied.
 */
export function beforeEffect(effectType?: string): Condition {
  return { type: 'before_effect', value: effectType };
}

/**
 * Triggered after an effect is applied.
 */
export function afterEffect(effectType?: string): Condition {
  return { type: 'after_effect', value: effectType };
}

/**
 * Triggered when a turn ends.
 */
export function onTurnEnd(): Condition {
  return { type: 'on_turn_end' };
}

/**
 * Inverts damage to healing.
 */
export function invertDamage(): (effect: Effect) => Effect | null {
  return (effect: Effect) => {
    if (effect.type === 'damage') {
      return {...effect, value: -(effect.value as number)};
    }
    return effect;
  };
}

/**
 * Creates an active effect.
 */
export function active(effect: Effect): ActiveEffect {
  return { kind: 'active', action: effect };
}

/**
 * Creates a passive effect.
 */
export function passive(config: {
  condition: Condition;
  action: Effect | Effect[] | ((effect: Effect) => Effect | null);
  duration?: Duration;
}): PassiveEffect {
  return { kind: 'passive', ...config };
}

/**
 * Creates a passive effect from a condition and effects.
 * @deprecated Use passive() instead.
 */
export function condition(cond: Condition, effects: Effect | Effect[]): PassiveEffect {
  return passive({ condition: cond, action: effects });
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
export function addPassiveEffect(effect: PassiveEffect): Effect {
  return {
    type: 'add_passive_effect',
    value: effect,
    target: 'self',
  };
}

