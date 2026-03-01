import { Duration, StatusEffect } from '../../item';
import { Listener } from '../engine.types';
import {
  DefaultListener,
  InvertListener,
  NegateListener,
  ReactiveRemovalListener,
} from './instances/listeners';

// Types moved from listener-data.ts

export interface DurationState {
  readonly type: 'turns' | 'charges' | 'permanent' | 'until_item_removed';
  readonly remaining: number;
}

export interface EffectInstanceState {
  readonly effect: StatusEffect;
  readonly currentDuration: DurationState;
}

export interface ListenerData {
  readonly instanceId: string;
  readonly playerId: string;
  readonly effectState: EffectInstanceState;
}

// Helper functions moved from listener-data.ts

function deriveInitialDurationState(duration?: Duration): DurationState {
  const type = duration?.type ?? 'permanent';
  const hasRemaining = type === 'charges' || type === 'turns';

  return {
    type,
    remaining: hasRemaining ? ((duration?.value as number) ?? 0) : 0,
  };
}

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

const LISTENER_MAP: Record<string, new (data: ListenerData) => Listener> = {
  negate: NegateListener,
  gas_mask: NegateListener,
  invert: InvertListener,
  reactive_removal: ReactiveRemovalListener,
};

// ListenerFactory plain object

export const ListenerFactory = {
  createAdvanceTurn(playerId: string): Listener {
    const effect: StatusEffect = {
      type: 'advance_turn',
      condition: { type: 'on_turn_end' },
      action: [{ type: 'advance_turn', value: 0, target: 'self' }],
      duration: { type: 'permanent' },
      genre: 'basic',
    };
    const listenerData = createInitialListenerData(
      `advance_turn-${playerId}`,
      playerId,
      effect,
    );
    return new DefaultListener(listenerData);
  },

  createFatigue(playerId: string): Listener {
    const effect: StatusEffect = {
      type: 'fatigue',
      condition: {
        type: 'and',
        subConditions: [{ type: 'on_turn_end' }, { type: 'has_no_items' }],
      },
      action: [{ type: 'damage', value: 1, target: 'self' }],
      duration: { type: 'permanent' },
      genre: 'basic',
    };
    const listenerData = createInitialListenerData(
      `fatigue-${playerId}`,
      playerId,
      effect,
    );
    return new DefaultListener(listenerData);
  },

  createPassive(
    instanceId: string,
    playerId: string,
    effect: StatusEffect,
  ): Listener {
    // For passive effects, set the duration to track when the item is removed
    // This ensures the effect expires when the item is removed from the loadout
    const effectWithDuration: StatusEffect = effect.duration
      ? effect
      : {
          ...effect,
          duration: { type: 'until_item_removed', value: instanceId },
        };

    const data = createInitialListenerData(
      instanceId,
      playerId,
      effectWithDuration,
    );
    return this.deserialize(data);
  },

  /**
   * Deserializes ListenerData back into a Listener instance.
   */
  deserialize(data: ListenerData): Listener {
    const effect = data.effectState.effect;
    const Constructor = LISTENER_MAP[effect.type] || DefaultListener;

    return new Constructor(data);
  },
};
