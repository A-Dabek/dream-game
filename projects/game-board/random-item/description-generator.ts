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
      }
      return '';
    })
    .filter((s) => s !== '')
    .join('. ');
}
