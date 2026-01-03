import {ItemEffect} from './item.model';

/**
 * Creates a damage effect targeting the opponent.
 */
export function attack(value: number): ItemEffect {
  return {
    type: 'damage',
    value,
    target: 'opponent',
  };
}

/**
 * Creates a healing effect targeting self.
 */
export function heal(value: number): ItemEffect {
  return {
    type: 'healing',
    value,
    target: 'self',
  };
}

/**
 * Creates a damage multiplier effect.
 */
export function damageMultiplier(value: number): ItemEffect {
  return {
    type: 'damageMultiplier',
    value,
  };
}
