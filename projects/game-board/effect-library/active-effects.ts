import { Effect, StatusEffect } from '../item/item.model';

export const ActiveEffectLibrary = {
  attack: (
    value: number | string,
    target: 'self' | 'enemy' = 'enemy',
  ): Effect => {
    return {
      type: 'damage',
      value,
      target,
    };
  },

  heal: (value: number | string, target: 'self' | 'enemy' = 'self'): Effect => {
    return {
      type: 'healing',
      value,
      target,
    };
  },

  modify_speed: (value: number, target: 'self' | 'enemy' = 'self'): Effect => {
    if (value >= 0) {
      return {
        type: 'speed_up',
        value,
        target,
      };
    } else {
      return {
        type: 'slow_down',
        value: -value,
        target,
      };
    }
  },

  remove_item: (value: string, target: 'self' | 'enemy' = 'self'): Effect => {
    return {
      type: 'remove_item',
      value,
      target,
    };
  },

  add_status_effect: (
    effect: StatusEffect,
    target: 'self' | 'enemy' = 'self',
  ): Effect => {
    return {
      type: 'add_status_effect',
      value: effect,
      target,
    };
  },
} as const;
