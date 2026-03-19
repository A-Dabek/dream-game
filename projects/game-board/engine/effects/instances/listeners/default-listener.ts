import { EngineState, GameEvent, ListenerData } from '../../../engine.model';
import { BaseEffectInstance } from '../base-effect-instance';
import { ReactiveCondition } from '../../conditions';

export class DefaultListener extends BaseEffectInstance {
  protected handleReaction(
    event: GameEvent,
    state: EngineState,
    data: ListenerData,
    condition: ReactiveCondition,
  ): GameEvent[] | null {
    return this.defaultHandleReaction(event, state, data, condition);
  }
}
