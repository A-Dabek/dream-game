import type { RandomEffectDefinition } from './random-item-definition';

/**
 * Generates human-readable descriptions for random effects.
 * Uses strict typing from ActiveRandomEffect to ensure all cases are handled.
 */
export function generateDescription(effects: RandomEffectDefinition[]): string {
  return effects
    .map((e) => {
      switch (e.type) {
        case 'damage':
          return e.target === 'self'
            ? `Deal ${e.value} damage to self`
            : `Deal ${e.value} damage`;
        case 'healing':
          return e.target === 'self'
            ? `Heal ${e.value} health`
            : `Heal ${e.value} health to enemy`;
        case 'speed_up':
          return e.target === 'self'
            ? `Speed up by ${e.value}`
            : `Speed up enemy by ${e.value}`;
        case 'slow_down':
          return e.target === 'self'
            ? `Slow down by ${e.value}`
            : `Slow down enemy by ${e.value}`;
        default:
          // Exhaustiveness check - ensures all types are handled
          const _exhaustive: never = e;
          return _exhaustive;
      }
    })
    .filter((s) => s !== '')
    .join('. ');
}
