import {
  Duration,
  Effect,
  StatusEffect,
  StatusEffectType,
} from '../item/item.model';
import { ConditionLibrary } from '../item/conditions';
import { charges, permanent, turns } from '../item/durations';
import { ActiveEffectLibrary } from './active-effects';
import { DoctorStatusEffectLibrary } from './doctor-status-effects';

export const StatusEffectLibrary = {
  poison: (chargeCount: number): StatusEffect => {
    return {
      type: 'poison',
      condition: ConditionLibrary.onTurnEnd(),
      action: [
        {
          type: 'damage',
          value: 1,
          target: 'self',
        },
      ],
      duration: charges(chargeCount),
      genre: 'poison',
      mergeStrategy: 'increase',
    };
  },

  gas_mask: (chargeCount: number): StatusEffect => {
    return {
      type: 'gas_mask',
      condition: ConditionLibrary.beforeStatusEffect('poison'),
      action: [{ type: 'negate', value: 'add_status_effect', target: 'self' }],
      duration: charges(chargeCount),
      genre: 'poison',
      mergeStrategy: 'new',
    };
  },

  poison_darts: (turnCount: number): StatusEffect => {
    return {
      type: 'poison_darts',
      condition: ConditionLibrary.onTurnEnd(),
      action: [
        ActiveEffectLibrary.add_status_effect(
          StatusEffectLibrary.poison(1),
          'self',
        ),
      ],
      duration: turns(turnCount),
      genre: 'poison',
      mergeStrategy: 'new',
    };
  },

  invert: (targetType: string, duration?: Duration): StatusEffect => {
    return {
      type: 'invert',
      condition: ConditionLibrary.beforeEffect(targetType),
      action: [{ type: 'invert', value: targetType, target: 'self' }],
      duration,
      genre: 'basic',
      mergeStrategy: 'new',
    };
  },

  negate: (targetType: string, duration?: Duration): StatusEffect => {
    return {
      type: 'negate',
      condition: ConditionLibrary.beforeEffect(targetType),
      action: [{ type: 'negate', value: targetType, target: 'self' }],
      duration,
      genre: 'basic',
      mergeStrategy: 'new',
    };
  },

  passive_attack: (
    value: number | string,
    target: 'self' | 'enemy' = 'self',
    type: StatusEffectType = 'periodic_attack',
  ): Effect => {
    return {
      type: 'add_status_effect',
      value: {
        type,
        condition: ConditionLibrary.onTurnEnd(),
        action: [
          {
            type: 'damage',
            value,
            target: 'enemy',
          },
        ],
        duration: permanent(),
        genre: 'basic',
        mergeStrategy: 'new',
      },
      target,
    };
  },

  reactive_removal: (targetType: string): StatusEffect => {
    return {
      type: 'reactive_removal',
      condition: ConditionLibrary.afterEffect(targetType),
      action: [],
      genre: 'basic',
      mergeStrategy: 'new',
    };
  },

  triple_threat: (damageValue: number): StatusEffect => {
    return {
      type: '_blueprint_triple_threat',
      condition: ConditionLibrary.onTurnEnd(),
      action: [ActiveEffectLibrary.attack(damageValue)],
      duration: permanent(),
      genre: 'basic',
      mergeStrategy: 'new',
    };
  },

  anti_nullify: (): StatusEffect => {
    return {
      type: 'anti_nullify',
      condition: ConditionLibrary.beforeNullify(),
      action: [],
      duration: permanent(),
      genre: 'basic',
      mergeStrategy: 'new',
    };
  },

  ...DoctorStatusEffectLibrary,
} as const;
