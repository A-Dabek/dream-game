import { EngineState, GameEvent } from '../../engine.types';

export interface ReactiveCondition {
  readonly type: string;
  shouldReact(event: GameEvent, playerId: string, state: EngineState): boolean;
}

export type ConditionPredicate = (
  event: GameEvent,
  playerId: string,
  state: EngineState,
) => boolean;
