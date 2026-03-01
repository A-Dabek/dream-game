import {
  Duration,
  Effect,
  StatusEffect,
  StatusEffectType,
} from '../item/item.model';
import { ConditionLibrary } from '../item/conditions';
import { charges, permanent, turns } from '../item/durations';
import { ActiveEffectLibrary } from './active-effects';

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
    };
  },

  gas_mask: (chargeCount: number): StatusEffect => {
    return {
      type: 'gas_mask',
      condition: ConditionLibrary.beforeStatusEffect('poison'),
      action: [{ type: 'negate', value: 'add_status_effect' }],
      duration: charges(chargeCount),
      genre: 'poison',
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
    };
  },

  invert: (targetType: string, duration?: Duration): StatusEffect => {
    return {
      type: 'invert',
      condition: ConditionLibrary.beforeEffect(targetType),
      action: [{ type: 'invert', value: targetType }],
      duration,
      genre: 'basic',
    };
  },

  negate: (targetType: string, duration?: Duration): StatusEffect => {
    return {
      type: 'negate',
      condition: ConditionLibrary.beforeEffect(targetType),
      action: [{ type: 'negate', value: targetType }],
      duration,
      genre: 'basic',
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
    };
  },

  triple_threat: (damageValue: number): StatusEffect => {
    return {
      type: '_blueprint_triple_threat',
      condition: ConditionLibrary.onTurnEnd(),
      action: [ActiveEffectLibrary.attack(damageValue)],
      duration: permanent(),
      genre: 'basic',
    };
  },
} as const;
