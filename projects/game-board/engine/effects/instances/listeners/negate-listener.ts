import { EngineState, GameEvent } from '../../../engine.types';
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
    return this.shouldReact(event, state) ? [] : null;
  }
}
