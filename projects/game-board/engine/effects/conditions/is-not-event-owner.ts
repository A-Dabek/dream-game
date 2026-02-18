import { ConditionPredicate } from './reactive-condition';

export const isNotEventOwner: ConditionPredicate = (event, playerId) =>
  'playerId' in event && event.playerId !== playerId;
