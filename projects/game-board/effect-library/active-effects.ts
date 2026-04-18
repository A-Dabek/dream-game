import { Effect, StatusEffect } from '../item/item.model';

/**
 * Strict type union for random-item generated effects.
 * Ensures only valid effect types are used.
 */
export type ActiveRandomEffect =
  | { type: 'damage'; value: number; target: 'self' | 'enemy' }
  | { type: 'healing'; value: number; target: 'self' | 'enemy' }
  | { type: 'speed_up'; value: number; target: 'self' | 'enemy' }
  | { type: 'slow_down'; value: number; target: 'self' | 'enemy' };

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

  /**
   * Smart attack that deals damage equal to the total number of items
   * both players have. The actual damage value is computed at runtime
   * by the engine's EffectHandlerFactory.
   */
  smart_attack: (target: 'self' | 'enemy' = 'enemy'): Effect => {
    return {
      type: 'item_count_damage',
      value: 0, // Value is computed by the handler based on game state
      target,
    };
  },
} as const;
