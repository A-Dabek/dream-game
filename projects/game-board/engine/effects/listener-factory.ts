import { StatusEffect } from '../../item';
import { Listener } from '../engine.types';
import { deriveInitialDurationState } from './durations';
import {
  DefaultListener,
  ImpatienceListener,
  InvertListener,
  NegateListener,
  ReactiveRemovalListener,
  BlueprintDamageToOwnerListener,
  BlueprintHealOnDamageListener,
  AntiNullifyListener,
} from './instances/listeners';

// Types moved from listener-data.ts

export interface DurationState {
  type: 'turns' | 'charges' | 'permanent' | 'until_item_removed';
  remaining: number;
}

export interface EffectInstanceState {
  effect: StatusEffect;
  currentDuration: DurationState;
}

export interface ListenerData {
  instanceId: string;
  playerId: string;
  effectState: EffectInstanceState;
}

// Helper functions moved from listener-data.ts

export function createInitialListenerData(
  instanceId: string,
  playerId: string,
  effect: StatusEffect,
): ListenerData {
  return {
    instanceId,
    playerId,
    effectState: {
      effect,
      currentDuration: deriveInitialDurationState(effect.duration),
    },
  };
}

const LISTENER_MAP: Record<string, new () => Listener> = {
  negate: NegateListener,
  gas_mask: NegateListener,
  invert: InvertListener,
  reactive_removal: ReactiveRemovalListener,
  _blueprint_damage_to_owner: BlueprintDamageToOwnerListener,
  _blueprint_heal_on_damage: BlueprintHealOnDamageListener,
  anti_nullify: AntiNullifyListener,
  impatience: ImpatienceListener,
};

// ListenerFactory plain object

export const ListenerFactory = {
  getAllListenerTypes(): string[] {
    return Object.keys(LISTENER_MAP);
  },

  getConstructor(type: string): new () => Listener {
    return LISTENER_MAP[type] || DefaultListener;
  },

  createAdvanceTurnData(playerId: string): ListenerData {
    const effect: StatusEffect = {
      type: 'advance_turn',
      condition: { type: 'on_turn_end' },
      action: [{ type: 'advance_turn', value: 0, target: 'self' }],
      duration: { type: 'permanent' },
      genre: 'basic',
      mergeStrategy: 'new',
    };
    return createInitialListenerData(
      `advance_turn-${playerId}`,
      playerId,
      effect,
    );
  },

  createFatigueData(playerId: string): ListenerData {
    const effect: StatusEffect = {
      type: 'impatience',
      condition: {
        type: 'and',
        subConditions: [{ type: 'on_turn_end' }, { type: 'has_no_items' }],
      },
      action: [], // Handled by ImpatienceListener directly to allow multi-step
      duration: { type: 'permanent', value: 1 },
      genre: 'basic',
      mergeStrategy: 'new',
    };
    return createInitialListenerData(
      `impatience-${playerId}`,
      playerId,
      effect,
    );
  },

  createPassiveData(
    instanceId: string,
    playerId: string,
    effect: StatusEffect,
  ): ListenerData {
    // For passive effects, set the duration to track when the item is removed
    // This ensures the effect expires when the item is removed from the loadout
    const effectWithDuration: StatusEffect = effect.duration
      ? effect
      : {
          ...effect,
          duration: { type: 'until_item_removed', value: instanceId },
        };

    return createInitialListenerData(instanceId, playerId, effectWithDuration);
  },
};
