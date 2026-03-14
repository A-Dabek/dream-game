import { EngineState, GameEvent, GameEventStatus } from '../../../engine.types';
import { BaseEffectInstance } from '../base-effect-instance';
import { ListenerData } from '../../types';

export class NegateListener extends BaseEffectInstance {
  constructor(listenerData: ListenerData) {
    super(listenerData);
  }

  protected handleReaction(
    event: GameEvent,
    state: EngineState,
  ): GameEvent[] | null {
    if (this.shouldReact(event, state)) {
      return [{ ...event, status: GameEventStatus.NULLIFY }];
    }
    return null;
  }
}
