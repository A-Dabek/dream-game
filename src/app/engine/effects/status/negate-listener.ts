import { EngineState, GameEvent } from '../../engine.model';
import { BaseStatusEffectInstance } from './base-status-effect-instance';

/**
 * Listener that negates (consumes) the triggering event.
 */
export class NegateListener extends BaseStatusEffectInstance {
  protected handleReaction(
    event: GameEvent,
    state: EngineState,
  ): GameEvent[] | null {
    return this.shouldReact(event, state) ? [] : null;
  }
}
