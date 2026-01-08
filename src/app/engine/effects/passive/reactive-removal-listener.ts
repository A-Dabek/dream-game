import { EngineState, GameEvent } from '../../engine.model';
import { BasePassiveInstance } from './base-passive-instance';

/**
 * Listener that removes its parent item when triggered.
 */
export class ReactiveRemovalListener extends BasePassiveInstance {
  protected handleReaction(
    event: GameEvent,
    state: EngineState,
  ): GameEvent[] | null {
    if (this.shouldReact(event, state)) {
      return [
        event,
        {
          type: 'remove_item',
          value: this.instanceId,
          target: 'self',
          playerId: this.playerId,
        },
      ];
    }
    return null;
  }
}
