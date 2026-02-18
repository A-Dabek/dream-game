import { EngineState, GameEvent } from '../../../engine.types';
import { BaseEffectInstance } from '../base-effect-instance';

export class InvertListener extends BaseEffectInstance {
  protected handleReaction(
    event: GameEvent,
    state: EngineState,
  ): GameEvent[] | null {
    if (!(this.shouldReact(event, state) && event.type === 'effect')) {
      return null;
    }
    const value = event.effect.value;
    if (typeof value !== 'number') {
      return null;
    }
    return [
      {
        type: 'effect',
        effect: { ...event.effect, value: -value },
        playerId: event.playerId,
      },
    ];
  }
}
