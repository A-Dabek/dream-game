import {
  EngineState,
  GameEvent,
  GameEventStatus,
  ListenerData,
} from '../../../engine.model';
import { BaseEffectInstance } from '../base-effect-instance';
import { ReactiveCondition } from '../../conditions';

export class AntiNullifyListener extends BaseEffectInstance {
  protected override handleReaction(
    event: GameEvent,
    state: EngineState,
    data: ListenerData,
    condition: ReactiveCondition,
  ): GameEvent[] | null {
    if (this.shouldReact(event, state, data, condition)) {
      return [{ ...event, status: GameEventStatus.PROGRESS }];
    }
    return null;
  }
}
