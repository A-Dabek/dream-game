import {
  EngineState,
  GameEvent,
  GameEventFactory,
} from '../../../engine.model';
import { BaseEffectInstance } from '../base-effect-instance';
import { ListenerData } from '../../types';

export class InvertListener extends BaseEffectInstance {
  constructor(listenerData: ListenerData) {
    super(listenerData);
  }

  protected handleReaction(
    event: GameEvent,
    state: EngineState,
  ): GameEvent[] | null {
    if (!(this.shouldReact(event, state) && event.type === 'effect')) {
      return null;
    }
    const value = event.effect.value;
    if (typeof value !== 'number') {
      return null;
    }
    return [
      GameEventFactory.createEffect(event.playerId, {
        ...event.effect,
        value: -value,
      }),
    ];
  }
}
