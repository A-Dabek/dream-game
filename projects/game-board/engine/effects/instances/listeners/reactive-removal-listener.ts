import {
  EngineState,
  GameEvent,
  GameEventFactory,
  ListenerData,
} from '../../../engine.model';
import { BaseEffectInstance } from '../base-effect-instance';
import { ReactiveCondition } from '../../conditions';

export class ReactiveRemovalListener extends BaseEffectInstance {
  protected handleReaction(
    event: GameEvent,
    state: EngineState,
    data: ListenerData,
    condition: ReactiveCondition,
  ): GameEvent[] | null {
    if (this.shouldReact(event, state, data, condition)) {
      return [
        event,
        GameEventFactory.createEffect(data.playerId, {
          type: 'remove_item',
          value: data.instanceId,
          target: 'self',
        }),
      ];
    }
    return null;
  }
}
