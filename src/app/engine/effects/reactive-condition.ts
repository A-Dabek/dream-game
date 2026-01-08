import {AFTER_EFFECT, BEFORE_EFFECT, Condition, Effect, isLifecycleEvent, ON_PLAY, ON_TURN_END,} from '../../item';
import {EngineState, GameEvent} from '../engine.model';

export interface ReactiveCondition {
  readonly type: string;
  shouldReact(event: GameEvent, playerId: string, state: EngineState): boolean;
}

abstract class BaseCondition implements ReactiveCondition {
  constructor(protected readonly condition: Condition) {}

  get type(): string {
    return this.condition.type;
  }

  shouldReact(event: GameEvent, playerId: string, state: EngineState): boolean {
    const isEffectType = !isLifecycleEvent(event.type);
    const conditionTypeMatches = this.condition.type === event.type ||
      (isEffectType && (this.condition.type === BEFORE_EFFECT || this.condition.type === AFTER_EFFECT));

    if (!conditionTypeMatches) return false;

    if (this.condition.value !== undefined) {
      const eventValue = event.type;
      if (this.condition.value !== eventValue) return false;
    }

    return this.checkSpecific(event, playerId, state);
  }

  protected abstract checkSpecific(event: GameEvent, playerId: string, state: EngineState): boolean;
}

class EffectCondition extends BaseCondition {
  protected checkSpecific(event: GameEvent, playerId: string, state: EngineState): boolean {
    const effect = event as Effect;

    const isTargetMe =
      effect.target === 'self' ? event.playerId === playerId : event.playerId !== playerId;

    return isTargetMe;
  }
}

class OnPlayCondition extends BaseCondition {
  protected checkSpecific(event: GameEvent, playerId: string, state: EngineState): boolean {
    if (event.type !== ON_PLAY) return false;
    return playerId !== event.playerId;
  }
}

class OnTurnEndCondition extends BaseCondition {
  protected checkSpecific(event: GameEvent, playerId: string, state: EngineState): boolean {
    if (event.type !== ON_TURN_END) return false;
    return playerId === event.playerId;
  }
}

class DefaultCondition implements ReactiveCondition {
  readonly type = 'default';
  shouldReact(): boolean {
    return false;
  }
}

export function createCondition(condition: Condition): ReactiveCondition {
  switch (condition.type) {
    case BEFORE_EFFECT:
    case AFTER_EFFECT:
      return new EffectCondition(condition);
    case ON_PLAY:
      return new OnPlayCondition(condition);
    case ON_TURN_END:
      return new OnTurnEndCondition(condition);
    default:
      return new DefaultCondition();
  }
}
