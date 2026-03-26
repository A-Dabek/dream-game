import { Effect, EffectValue, ItemId } from '../item';
import {
  GameEvent,
  GameEventInput,
  GameEventStatus,
  LifecyclePhase,
  ModifyStatusEffectPayload,
} from './engine.types';

export const GameEventFactory = {
  create(event: GameEventInput): GameEvent {
    return {
      ...event,
      processedBy: event.processedBy ?? [],
      status: event.status ?? GameEventStatus.NEW,
    } as GameEvent;
  },

  createEffect(
    playerId: string,
    effect: Effect,
    processedBy: string[] = [],
    status = GameEventStatus.NEW,
  ): GameEvent {
    return {
      type: 'effect',
      playerId,
      effect,
      processedBy,
      status,
    };
  },

  createModifyStatusEffect(
    playerId: string,
    payload: ModifyStatusEffectPayload,
    processedBy: string[] = [],
    status = GameEventStatus.NEW,
  ): GameEvent {
    return this.createEffect(
      playerId,
      {
        type: 'modify_status_effect',
        value: payload as unknown as EffectValue,
        target: 'self',
      },
      processedBy,
      status,
    );
  },

  createLifecycle(
    playerId: string,
    phase: LifecyclePhase,
    processedBy: string[] = [],
    status = GameEventStatus.NEW,
  ): GameEvent {
    return {
      type: 'lifecycle',
      playerId,
      phase,
      processedBy,
      status,
    };
  },

  createOnPlay(
    playerId: string,
    itemId: ItemId,
    processedBy: string[] = [],
    status = GameEventStatus.NEW,
  ): GameEvent {
    return {
      type: 'on_play',
      playerId,
      itemId,
      processedBy,
      status,
    };
  },
} as const;
