import { Effect, ItemId } from '../item';
import { GameEvent, GameEventInput, LifecyclePhase } from './engine.types';

export const GameEventFactory = {
  create(event: GameEventInput): GameEvent {
    return {
      ...event,
      processedBy: event.processedBy ?? [],
    } as GameEvent;
  },

  createEffect(
    playerId: string,
    effect: Effect,
    processedBy: string[] = [],
  ): GameEvent {
    return {
      type: 'effect',
      playerId,
      effect,
      processedBy,
    };
  },

  createLifecycle(
    playerId: string,
    phase: LifecyclePhase,
    processedBy: string[] = [],
  ): GameEvent {
    return {
      type: 'lifecycle',
      playerId,
      phase,
      processedBy,
    };
  },

  createOnPlay(
    playerId: string,
    itemId: ItemId,
    processedBy: string[] = [],
  ): GameEvent {
    return {
      type: 'on_play',
      playerId,
      itemId,
      processedBy,
    };
  },
} as const;
