import {PassiveEffect} from '../../item';
import {Listener} from '../engine.model';
import {DefaultPassiveInstance} from './passive-instance';

export class ListenerFactory {
  static createFromPassive(
    instanceId: string,
    playerId: string,
    effect: PassiveEffect
  ): Listener {
    // In the future, we can switch based on effect.type
    // if (effect.type === 'custom_listener') return new CustomListener(...);

    return DefaultPassiveInstance.create(instanceId, playerId, effect);
  }
}
