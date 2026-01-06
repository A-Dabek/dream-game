import {EngineState, GameEvent} from '../engine.model';
import {BasePassiveInstance} from './base-passive-instance';
import {PassiveCondition} from './passive-condition';
import {PassiveDuration} from './passive-duration';

/**
 * Listener that negates (consumes) the triggering event.
 */
export class NegateListener extends BasePassiveInstance {
  handle(event: GameEvent, state: EngineState) {
    if (this.shouldReact(event, state)) {
      return {
        event: undefined,
        nextListener: this.onHandle(),
      };
    }
    return {
      event,
      nextListener: this.update(event),
    };
  }

  protected clone(condition: PassiveCondition, duration: PassiveDuration): this {
    return new NegateListener(
      this.instanceId,
      this.playerId,
      this.effect,
      condition,
      duration
    ) as this;
  }
}

/**
 * Listener that inverts the value of the triggering event.
 */
export class InvertListener extends BasePassiveInstance {
  handle(event: GameEvent, state: EngineState) {
    if (this.shouldReact(event, state)) {
      if ('value' in event && typeof event.value === 'number') {
        const inverted = {...event, value: -event.value};
        return {
          event: inverted,
          nextListener: this.onHandle(),
        };
      }
    }
    return {
      event,
      nextListener: this.update(event),
    };
  }

  protected clone(condition: PassiveCondition, duration: PassiveDuration): this {
    return new InvertListener(
      this.instanceId,
      this.playerId,
      this.effect,
      condition,
      duration
    ) as this;
  }
}
