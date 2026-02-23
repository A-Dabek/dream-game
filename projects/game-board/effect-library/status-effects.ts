import {
  Condition,
  Duration,
  Effect,
  StatusEffect,
  StatusEffectType,
} from '../item/item.model';
import { beforeEffect, onTurnEnd } from '../item/conditions';
import { charges, permanent } from '../item/durations';

export const StatusEffectLibrary = {
  poison: (chargeCount: number): StatusEffect => {
    return {
      type: 'poison',
      condition: onTurnEnd(),
      action: [
        {
          type: 'damage',
          value: 1,
          target: 'self',
        },
      ],
      duration: charges(chargeCount),
    };
  },

  invert: (targetType: string, duration?: Duration): StatusEffect => {
    return {
      type: 'invert',
      condition: beforeEffect(targetType),
      action: [{ type: 'invert', value: targetType }],
      duration,
    };
  },

  negate: (targetType: string, duration?: Duration): StatusEffect => {
    return {
      type: 'negate',
      condition: beforeEffect(targetType),
      action: [{ type: 'negate', value: targetType }],
      duration,
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
        condition: onTurnEnd(),
        action: [
          {
            type: 'damage',
            value,
            target: 'enemy',
          },
        ],
        duration: permanent(),
      },
      target,
    };
  },

  status_effect: (config: {
    type: StatusEffectType;
    condition: Condition;
    action: Effect[];
    duration?: Duration;
  }): StatusEffect => {
    return { ...config };
  },
} as const;
