import {
  EngineState,
  GameEvent,
  GameEventStatus,
  ListenerData,
} from '../../../engine.model';
import { BaseEffectInstance } from '../base-effect-instance';
import { ReactiveCondition } from '../../conditions';

export class NegateListener extends BaseEffectInstance {
  protected handleReaction(
    event: GameEvent,
    state: EngineState,
    data: ListenerData,
    condition: ReactiveCondition,
  ): GameEvent[] | null {
    if (this.shouldReact(event, state, data, condition)) {
      return [{ ...event, status: GameEventStatus.NULLIFY }];
    }
    return null;
  }
}
