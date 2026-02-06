import { Effect, ItemId, Loadout } from '../item';

export interface EngineLoadout extends Loadout {
  readonly id: string;
}

export interface EngineState {
  readonly playerOne: EngineLoadout;
  readonly playerTwo: EngineLoadout;
  readonly listeners: Listener[];
  readonly gameOver: boolean;
  readonly winnerId?: string;
}

export type LogEntry =
  | { type: 'event'; event: GameEvent }
  | { type: 'reaction'; instanceId: string; playerId: string; event: GameEvent }
  | { type: 'processor'; effect: Effect; targetPlayerId: string };

export type LifecyclePhase =
  | 'game_start'
  | 'on_turn_start'
  | 'on_turn_end'
  | 'game_over';

export type LifecycleGameEvent = {
  type: 'lifecycle';
  playerId: string;
  phase: LifecyclePhase;
};

export type GameEvent =
  | { type: 'on_play'; playerId: string; itemId: ItemId }
  | LifecycleGameEvent
  | (Effect & { playerId: string });

// Type guards for GameEvent variants to avoid `any` casts when handling events
export function isLifecycleGameEvent(
  event: GameEvent,
): event is LifecycleGameEvent {
  return event.type === 'lifecycle';
}

export function isOnPlayEvent(
  event: GameEvent,
): event is { type: 'on_play'; playerId: string; itemId: ItemId } {
  return event.type === 'on_play';
}

export function isEffectEvent(
  event: GameEvent,
): event is Effect & { playerId: string } {
  // Effect events are the remaining discriminants within GameEvent that are not lifecycle nor on_play
  return event.type !== 'lifecycle' && event.type !== 'on_play';
}

export interface Listener {
  readonly instanceId: string;
  readonly playerId: string;
  handle(
    event: GameEvent,
    state: EngineState,
  ): {
    event: GameEvent[];
  };
}
