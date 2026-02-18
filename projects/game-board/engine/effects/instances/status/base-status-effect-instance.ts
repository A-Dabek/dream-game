import { GameEvent } from '../../../engine.types';
import { BaseEffectInstance } from '../base-effect-instance';

export abstract class BaseStatusEffectInstance extends BaseEffectInstance {
  protected wrapResult(events: GameEvent[]): { event: GameEvent[] } {
    let finalEvents = events;
    if (this.duration.isExpired) {
      finalEvents = this.addEvent(finalEvents, {
        type: 'effect',
        effect: {
          type: 'remove_listener',
          value: this.instanceId,
        },
        playerId: this.playerId,
      });
    }
    return { event: finalEvents };
  }
}
