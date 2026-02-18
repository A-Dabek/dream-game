import { ConditionPredicate } from './reactive-condition';

export const isTargetMe: ConditionPredicate = (event, playerId) => {
  if (event.type !== 'effect') return false;
  const target = event.effect.target as 'self' | 'enemy' | undefined;
  if (!target) return false;
  const isMe = event.playerId === playerId;
  return target === 'self' ? isMe : !isMe;
};
