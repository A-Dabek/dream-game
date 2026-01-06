import {beforeEffect, onTurnEnd} from './conditions';
import {permanent} from './durations';
import {Condition, Duration, Effect, PassiveEffect} from './item.model';

/**
 * Creates a damage effect.
 */
export function attack(value: number | string, target: 'self' | 'enemy' = 'enemy'): Effect {
  return {
    type: 'damage',
    value,
    target,
  };
}

/**
 * Creates a passive damage effect that deals damage at the end of the turn.
 */
export function passiveAttack(value: number | string, target: 'self' | 'enemy' = 'self'): Effect {
  return addPassiveEffect(
    passive({
      condition: onTurnEnd(),
      action: [attack(value)],
      duration: permanent(),
    }),
    target
  );
}

/**
 * Creates an effect that removes an item from a loadout.
 */
export function removeItem(value: string, target: 'self' | 'enemy' = 'self'): Effect {
  return {
    type: 'remove_item',
    value,
    target,
  };
}

/**
 * Inverts an effect (e.g. damage to healing).
 */
export function invert(targetType: string, duration?: Duration): PassiveEffect {
  return passive({
    type: 'invert',
    condition: beforeEffect(targetType),
    action: [{type: 'invert', value: targetType}],
    duration,
  });
}

/**
 * Negates an effect.
 */
export function negate(targetType: string, duration?: Duration): PassiveEffect {
  return passive({
    type: 'negate',
    condition: beforeEffect(targetType),
    action: [{type: 'negate', value: targetType}],
    duration,
  });
}

/**
 * Creates a passive effect.
 */
export function passive(config: {
  condition: Condition;
  action: Effect[];
  duration?: Duration;
  type?: string;
}): PassiveEffect {
  return { ...config };
}

/**
 * Creates an effect that adds a persistent passive effect to the engine.
 */
export function addPassiveEffect(effect: PassiveEffect, target: 'self' | 'enemy' = 'self'): Effect {
  return {
    type: 'add_passive_effect',
    value: effect,
    target,
  };
}
