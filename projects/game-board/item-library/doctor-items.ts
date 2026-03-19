import { ItemDefinition } from '../item';
import { ActiveEffectLibrary } from '../effect-library/active-effects';
import { StatusEffectLibrary } from '../effect-library/status-effects';

export const DoctorItemLibrary = {
  stitches: (): ItemDefinition => ({
    genre: 'doctor',
    onPlayEffects: [{ type: 'stitches_heal', value: 10, target: 'self' }],
  }),

  adrenaline: (): ItemDefinition => ({
    genre: 'doctor',
    onPlayEffects: [
      ActiveEffectLibrary.modify_speed(10, 'self'),
      ActiveEffectLibrary.add_status_effect(
        StatusEffectLibrary.heart_strain(5),
        'self',
      ),
    ],
  }),

  drip: (): ItemDefinition => ({
    genre: 'doctor',
    onPlayEffects: [
      ActiveEffectLibrary.add_status_effect(
        StatusEffectLibrary.drip(25),
        'self',
      ),
    ],
  }),
} as const;
