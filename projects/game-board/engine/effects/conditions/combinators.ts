import { EngineState, GameEvent } from '../../engine.types';
import { ConditionPredicate } from './reactive-condition';

export const and =
  (...predicates: ConditionPredicate[]): ConditionPredicate =>
  (event: GameEvent, playerId: string, state: EngineState) =>
    predicates.every((p) => p(event, playerId, state));

export const or =
  (...predicates: ConditionPredicate[]): ConditionPredicate =>
  (event: GameEvent, playerId: string, state: EngineState) =>
    predicates.some((p) => p(event, playerId, state));

export const not =
  (predicate: ConditionPredicate): ConditionPredicate =>
  (event: GameEvent, playerId: string, state: EngineState) =>
    !predicate(event, playerId, state);
