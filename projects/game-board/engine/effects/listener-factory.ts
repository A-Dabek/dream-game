import { StatusEffect } from '../../item';
import { Listener } from '../engine.types';
import {
  DefaultPassiveInstance,
  ReactiveRemovalListener,
} from './instances/passive';
import {
  DefaultStatusEffectInstance,
  FatigueListener,
  InvertListener,
  NegateListener,
  AdvanceTurnListener,
} from './instances/status';

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
    if (effect.type === 'reactive_removal') {
      return new ReactiveRemovalListener(instanceId, playerId, effect);
    }

    return DefaultPassiveInstance.create(instanceId, playerId, effect);
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

    return DefaultStatusEffectInstance.create(instanceId, playerId, effect);
  }
}
