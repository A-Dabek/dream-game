import {Condition} from '../../item';
import {EngineState, GameEvent} from '../engine.model';

export interface PassiveCondition {
  readonly type: string;
  shouldReact(event: GameEvent, playerId: string, state: EngineState): boolean;
}

abstract class BaseCondition implements PassiveCondition {
  constructor(protected readonly condition: Condition) {}

  get type(): string {
    return this.condition.type;
  }

  shouldReact(event: GameEvent, playerId: string, state: EngineState): boolean {
    const isEffectType = event.type !== 'on_play' && event.type !== 'on_turn_end';
    const conditionTypeMatches = this.condition.type === event.type ||
      (isEffectType && (this.condition.type === 'before_effect' || this.condition.type === 'after_effect'));

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
    if (!('actingPlayerId' in event)) return false;
    const effect = event;

    const isTargetMe =
      effect.target === 'self' ? event.actingPlayerId === playerId : event.actingPlayerId !== playerId;

    return isTargetMe;
  }
}

class OnPlayCondition extends BaseCondition {
  protected checkSpecific(event: GameEvent, playerId: string, state: EngineState): boolean {
    if (event.type !== 'on_play') return false;
    return playerId !== (event as any).playerId;
  }
}

class OnTurnEndCondition extends BaseCondition {
  protected checkSpecific(event: GameEvent, playerId: string, state: EngineState): boolean {
    if (event.type !== 'on_turn_end') return false;
    return playerId === (event as any).playerId;
  }
}

class DefaultCondition implements PassiveCondition {
  readonly type = 'default';
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
