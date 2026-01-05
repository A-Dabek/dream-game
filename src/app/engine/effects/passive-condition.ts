import {Condition} from '../../item';
import {EngineState, LifecycleEvent} from '../engine.model';

export interface PassiveCondition {
  shouldReact(event: LifecycleEvent, playerId: string, state: EngineState): boolean;
}

abstract class BaseCondition implements PassiveCondition {
  constructor(protected readonly condition: Condition) {}

  shouldReact(event: LifecycleEvent, playerId: string, state: EngineState): boolean {
    if (this.condition.type !== event.type) return false;

    if (this.condition.value !== undefined) {
      const eventValue = 'effect' in event ? event.effect.type : undefined;
      if (this.condition.value !== eventValue) return false;
    }

    return this.checkSpecific(event, playerId, state);
  }

  protected abstract checkSpecific(event: LifecycleEvent, playerId: string, state: EngineState): boolean;
}

class EffectCondition extends BaseCondition {
  override shouldReact(event: LifecycleEvent, playerId: string, state: EngineState): boolean {
    if (this.condition.type !== event.type) return false;

    if (this.condition.value !== undefined) {
      const eventValue = 'effect' in event ? event.effect.type : undefined;
      if (this.condition.value !== eventValue) return false;
    }

    return this.checkSpecific(event, playerId, state);
  }

  protected checkSpecific(event: LifecycleEvent, playerId: string, state: EngineState): boolean {
    if (event.type !== 'before_effect' && event.type !== 'after_effect') return false;
    const effect = event.effect;

    const isTargetMe = effect.target === 'self'
      ? event.actingPlayerId === playerId
      : event.actingPlayerId !== playerId;

    return isTargetMe;
  }
}

class OnPlayCondition extends BaseCondition {
  protected checkSpecific(event: LifecycleEvent, playerId: string, state: EngineState): boolean {
    if (event.type !== 'on_play') return false;
    return playerId !== event.actingPlayerId;
  }
}

class OnTurnEndCondition extends BaseCondition {
  protected checkSpecific(event: LifecycleEvent, playerId: string, state: EngineState): boolean {
    if (event.type !== 'on_turn_end') return false;
    return playerId === event.actingPlayerId;
  }
}

class DefaultCondition implements PassiveCondition {
  shouldReact(): boolean {
    return false;
  }
}

export function createCondition(condition: Condition): PassiveCondition {
  switch (condition.type) {
    case 'before_effect':
    case 'after_effect':
      return new EffectCondition(condition);
    case 'on_play':
      return new OnPlayCondition(condition);
    case 'on_turn_end':
      return new OnTurnEndCondition(condition);
    default:
      return new DefaultCondition();
  }
}
