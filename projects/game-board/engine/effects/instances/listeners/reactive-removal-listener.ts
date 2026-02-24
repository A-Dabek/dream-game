import { EngineState, GameEvent } from '../../../engine.types';
import { BaseEffectInstance } from '../base-effect-instance';
import { ListenerData } from '../../types';

export class ReactiveRemovalListener extends BaseEffectInstance {
  constructor(listenerData: ListenerData) {
    super(listenerData);
  }

  protected handleReaction(
    event: GameEvent,
    state: EngineState,
  ): GameEvent[] | null {
    if (this.shouldReact(event, state)) {
      return [
        event,
        {
          type: 'effect',
          effect: {
            type: 'remove_item',
            value: this.instanceId,
            target: 'self',
          },
          playerId: this.playerId,
        },
      ];
    }
    return null;
  }
}
