import { StatusEffect } from '../../item';
import { Listener } from '../engine.types';
import { ItemDuration } from './durations';
import {
  DefaultListener,
  FatigueListener,
  InvertListener,
  NegateListener,
  AdvanceTurnListener,
  ReactiveRemovalListener,
} from './instances/listeners';

export class ListenerFactory {
  static createAdvanceTurn(playerId: string): Listener {
    return new AdvanceTurnListener(`advance_turn-${playerId}`, playerId);
  }

  static createFatigue(playerId: string): Listener {
    return new FatigueListener(`fatigue-${playerId}`, playerId);
  }

  static createPassive(
    instanceId: string,
    playerId: string,
    effect: StatusEffect,
  ): Listener {
    const itemDuration = new ItemDuration(instanceId);

    if (effect.type === 'reactive_removal') {
      return new ReactiveRemovalListener(
        instanceId,
        playerId,
        effect,
        undefined,
        itemDuration,
      );
    }

    return new DefaultListener(
      instanceId,
      playerId,
      effect,
      undefined,
      itemDuration,
    );
  }

  static createStatusEffect(
    instanceId: string,
    playerId: string,
    effect: StatusEffect,
  ): Listener {
    if (effect.type === 'negate') {
      return new NegateListener(instanceId, playerId, effect);
    }
    if (effect.type === 'invert') {
      return new InvertListener(instanceId, playerId, effect);
    }

    return DefaultListener.create(instanceId, playerId, effect);
  }
}
