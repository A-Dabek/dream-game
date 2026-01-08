import { StatusEffect } from '../../item/item.model';
import { Listener } from '../engine.model';
import { DefaultPassiveInstance, ReactiveRemovalListener } from './passive';
import {
  DefaultStatusEffectInstance,
  InvertListener,
  NegateListener,
} from './status';

export class ListenerFactory {
  /**
   * Creates a listener for a passive effect tied to an item.
   */
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

  /**
   * Creates a listener for a status effect applied to a player.
   */
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
