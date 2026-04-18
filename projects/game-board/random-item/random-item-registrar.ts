import { IconName } from '@dream/shared-basic';
import { RandomItemDefinition } from './random-item-definition';
import { registerItem } from '../item-library/item-registry';
import { ActiveEffectLibrary } from '../effect-library/active-effects';
import { generateDescription } from './description-generator';

export type ConventionRegistrar = (
  id: string,
  convention: { name: string; icon: IconName; description: string },
) => void;

let conventionRegistrar: ConventionRegistrar | null = null;

export function setRandomItemConventionRegistrar(r: ConventionRegistrar) {
  conventionRegistrar = r;
}

export const RandomItemRegistrar = {
  register(def: RandomItemDefinition): void {
    // Engine registration
    registerItem(def.id, () => ({
      genre: 'basic',
      onPlayEffects: def.onPlayEffects.map((e) => {
        if (e.type === 'damage') {
          return ActiveEffectLibrary.attack(e.value, e.target);
        } else {
          return ActiveEffectLibrary.heal(e.value, e.target);
        }
      }),
    }));

    // UI registration (optional)
    if (conventionRegistrar) {
      const name = def.icon
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      conventionRegistrar(def.id, {
        name,
        icon: def.icon as IconName,
        description: generateDescription(def.onPlayEffects),
      });
    }
  },
};
