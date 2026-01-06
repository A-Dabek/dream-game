import {EngineState, GameEvent} from '../engine.model';
import {BasePassiveInstance} from './base-passive-instance';

/**
 * Listener that negates (consumes) the triggering event.
 */
export class NegateListener extends BasePassiveInstance {
  protected handleReaction(event: GameEvent, state: EngineState): GameEvent[] | null {
    return this.shouldReact(event, state) ? [] : null;
  }
}

/**
 * Listener that inverts the value of the triggering event.
 */
export class InvertListener extends BasePassiveInstance {
  protected handleReaction(event: GameEvent, state: EngineState): GameEvent[] | null {
    if (this.shouldReact(event, state) && 'value' in event && typeof event.value === 'number') {
      return [{ ...event, value: -event.value }];
    }
    return null;
  }
}

/**
 * Listener that removes its parent item when triggered.
 */
export class ReactiveRemovalListener extends BasePassiveInstance {
  protected handleReaction(event: GameEvent, state: EngineState): GameEvent[] | null {
    if (this.shouldReact(event, state)) {
      return [
        event,
        {
          type: 'remove_item',
          value: this.instanceId,
          target: 'self',
          actingPlayerId: this.playerId,
        },
      ];
    }
    return null;
  }
}
