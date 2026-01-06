import {PassiveEffect} from '../../item';
import {Listener} from '../engine.model';
import {InvertListener, NegateListener, ReactiveRemovalListener} from './modifier-listeners';
import {DefaultPassiveInstance} from './passive-instance';

export class ListenerFactory {
  static createFromPassive(
    instanceId: string,
    playerId: string,
    effect: PassiveEffect
  ): Listener {
    if (effect.type === 'negate') {
      return new NegateListener(instanceId, playerId, effect);
    }
    if (effect.type === 'invert') {
      return new InvertListener(instanceId, playerId, effect);
    }
    if (effect.type === 'reactive_removal') {
      return new ReactiveRemovalListener(instanceId, playerId, effect);
    }

    return DefaultPassiveInstance.create(instanceId, playerId, effect);
  }
}
