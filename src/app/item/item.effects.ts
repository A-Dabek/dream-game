import {ItemEffect} from './item.model';

/**
 * Creates a damage effect targeting the opponent.
 */
export function attack(value: number): ItemEffect {
  return {
    type: 'damage',
    value,
  };
}

/**
 * Creates a healing effect targeting self.
 */
export function heal(value: number): ItemEffect {
  return {
    type: 'healing',
    value,
  };
}


/**
 * Creates a passive damage effect that deals damage at the end of the turn.
 */
export function passiveAttack(value: number): ItemEffect {
  return {
    type: 'add_passive_attack',
    value,
  };
}
