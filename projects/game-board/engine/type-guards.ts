// Type guards for GameEvent variants to avoid `any` casts when handling events
import { Effect } from '../item';
import { GameEvent, LifecycleGameEvent } from './engine.model';

export function isLifecycleGameEvent(
  event: GameEvent,
): event is LifecycleGameEvent {
  return event.type === 'lifecycle';
}

export function isEffectEvent(
  event: GameEvent,
): event is { type: 'effect'; effect: Effect; playerId: string } {
  // Effect events are now explicitly wrapped under the 'effect' discriminant
  return event.type === 'effect';
}
