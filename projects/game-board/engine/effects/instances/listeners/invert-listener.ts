import {
  EngineState,
  GameEvent,
  GameEventFactory,
  ListenerData,
} from '../../../engine.model';
import { BaseEffectInstance } from '../base-effect-instance';
import { ReactiveCondition } from '../../conditions';

export class InvertListener extends BaseEffectInstance {
  protected handleReaction(
    event: GameEvent,
    state: EngineState,
    data: ListenerData,
    condition: ReactiveCondition,
  ): GameEvent[] | null {
    if (
      !(
        this.shouldReact(event, state, data, condition) &&
        event.type === 'effect'
      )
    ) {
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
