import { RandomEffectDefinition } from './random-item-definition';

export function generateDescription(effects: RandomEffectDefinition[]): string {
  return effects
    .map((e) => {
      if (e.type === 'damage') {
        return e.target === 'self'
          ? `Deal ${e.value} damage to self`
          : `Deal ${e.value} damage`;
      } else if (e.type === 'healing') {
        return e.target === 'self'
          ? `Heal ${e.value} health`
          : `Heal ${e.value} health to enemy`;
      } else if (e.type === 'speed_up') {
        return e.target === 'self'
          ? `Speed up by ${e.value}`
          : `Speed up enemy by ${e.value}`;
      } else if (e.type === 'slow_down') {
        return e.target === 'self'
          ? `Slow down by ${e.value}`
          : `Slow down enemy by ${e.value}`;
      }
      return '';
    })
    .filter((s) => s !== '')
    .join('. ');
}
