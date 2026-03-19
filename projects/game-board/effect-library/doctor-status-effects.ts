import { StatusEffect } from '../item/item.model';
import { ConditionLibrary } from '../item/conditions';
import { charges } from '../item/durations';

export const DoctorStatusEffectLibrary = {
  heart_strain: (chargeCount: number): StatusEffect => {
    return {
      type: 'heart_strain',
      condition: ConditionLibrary.onTurnStart(),
      action: [
        {
          type: 'slow_down',
          value: 3,
          target: 'self',
        },
      ],
      duration: charges(chargeCount),
      genre: 'doctor',
      mergeStrategy: 'new',
    };
  },

  drip: (chargeCount: number): StatusEffect => {
    return {
      type: 'drip',
      condition: {
        type: 'or',
        subConditions: [{ type: 'on_turn_start' }, { type: 'on_turn_end' }],
      },
      action: [
        {
          type: 'healing',
          value: 1,
          target: 'self',
        },
      ],
      duration: charges(chargeCount),
      genre: 'doctor',
      mergeStrategy: 'increase',
    };
  },

  stitches: (chargeCount: number): StatusEffect => {
    return {
      type: 'stitches',
      condition: ConditionLibrary.beforeEffect('damage'),
      action: [], // Handled by StitchesListener
      duration: charges(chargeCount),
      genre: 'doctor',
      mergeStrategy: 'new',
    };
  },
} as const;
