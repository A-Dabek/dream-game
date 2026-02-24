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
  if (!duration) {
    return { type: 'permanent', remaining: 0 };
  }
  switch (duration.type) {
    case 'charges':
      return { type: 'charges', remaining: (duration.value as number) ?? 0 };
    case 'turns':
      return { type: 'turns', remaining: (duration.value as number) ?? 0 };
    case 'until_item_removed':
      return { type: 'until_item_removed', remaining: 0 };
    case 'permanent':
    default:
      return { type: 'permanent', remaining: 0 };
  }
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

// ListenerFactory plain object

export const ListenerFactory = {
  createAdvanceTurn(playerId: string): Listener {
    const effect: StatusEffect = {
      type: 'advance_turn',
      condition: { type: 'on_turn_end' },
      action: [{ type: 'advance_turn', value: 0, target: 'self' }],
      duration: { type: 'permanent' },
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

    if (effectWithDuration.type === 'reactive_removal') {
      const listenerData = createInitialListenerData(
        instanceId,
        playerId,
        effectWithDuration,
      );
      return new ReactiveRemovalListener(listenerData);
    }

    const listenerData = createInitialListenerData(
      instanceId,
      playerId,
      effectWithDuration,
    );
    return new DefaultListener(listenerData);
  },

  createStatusEffect(
    instanceId: string,
    playerId: string,
    effect: StatusEffect,
  ): Listener {
    if (effect.type === 'negate') {
      const listenerData = createInitialListenerData(
        instanceId,
        playerId,
        effect,
      );
      return new NegateListener(listenerData);
    }
    if (effect.type === 'invert') {
      const listenerData = createInitialListenerData(
        instanceId,
        playerId,
        effect,
      );
      return new InvertListener(listenerData);
    }

    const listenerData = createInitialListenerData(
      instanceId,
      playerId,
      effect,
    );
    return new DefaultListener(listenerData);
  },

  /**
   * Deserializes ListenerData back into a Listener instance.
   */
  deserialize(data: ListenerData): Listener {
    const effect = data.effectState.effect;

    if (effect.type === 'negate') {
      return new NegateListener(data);
    }
    if (effect.type === 'invert') {
      return new InvertListener(data);
    }
    if (effect.type === 'reactive_removal') {
      return new ReactiveRemovalListener(data);
    }

    return new DefaultListener(data);
  },
};
