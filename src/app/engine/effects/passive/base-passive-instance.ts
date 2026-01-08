import { GameEvent } from '../../engine.model';
import { BaseEffectInstance } from '../base-effect-instance';

/**
 * Base class for passive effects tied to an item.
 */
export abstract class BasePassiveInstance extends BaseEffectInstance {
  protected wrapResult(events: GameEvent[]): { event: GameEvent[] } {
    let finalEvents = events;
    for (const e of events) {
      const removalEvent = this.checkRemoveItem(e);
      if (removalEvent) {
        finalEvents = this.addEvent(finalEvents, removalEvent);
        break;
      }
    }
    return { event: finalEvents };
  }
}
