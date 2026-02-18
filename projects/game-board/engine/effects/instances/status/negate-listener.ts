import { EngineState, GameEvent } from '../../../engine.types';
import { BaseStatusEffectInstance } from './base-status-effect-instance';

export class NegateListener extends BaseStatusEffectInstance {
  protected handleReaction(
    event: GameEvent,
    state: EngineState,
  ): GameEvent[] | null {
    return this.shouldReact(event, state) ? [] : null;
  }
}
