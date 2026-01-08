import {EngineState, GameEvent} from '../../engine.model';
import {BaseStatusEffectInstance} from './base-status-effect-instance';

/**
 * Listener that inverts the value of the triggering event.
 */
export class InvertListener extends BaseStatusEffectInstance {
  protected handleReaction(event: GameEvent, state: EngineState): GameEvent[] | null {
    if (this.shouldReact(event, state) && 'value' in event && typeof event.value === 'number') {
      return [{ ...event, value: -event.value }];
    }
    return null;
  }
}
