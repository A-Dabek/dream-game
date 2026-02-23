import { StatusEffectId } from '@dream/game-board';
import { EffectDisplayMetadata } from './active-effect-display-map';

export const STATUS_EFFECT_DISPLAY_MAP: Record<
  StatusEffectId,
  EffectDisplayMetadata
> = {
  poison: {
    iconName: 'poison',
    description: 'Deals periodic damage over time',
  },
  invert: {
    iconName: 'invert',
    description: 'Inverts effects or outcomes',
  },
  negate: {
    iconName: 'negate',
    description: 'Nullifies or blocks effects',
  },
  passive_attack: {
    iconName: 'passive-attack',
    description: 'Grants a passive damage effect',
  },
  status_effect: {
    iconName: 'status-effect',
    description: 'Generic status effect',
  },
};
