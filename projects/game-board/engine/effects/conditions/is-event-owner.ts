import { ConditionPredicate } from './reactive-condition';

export const isEventOwner: ConditionPredicate = (event, playerId) =>
  'playerId' in event && event.playerId === playerId;
