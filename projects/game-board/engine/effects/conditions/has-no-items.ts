import { EngineState } from '../../engine.types';
import { ConditionPredicate } from './reactive-condition';

export const hasNoItems: ConditionPredicate = (event, playerId, state) => {
  const player =
    state.playerOne.id === playerId ? state.playerOne : state.playerTwo;
  return player.items.length === 0;
};
