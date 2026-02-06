import { Effect, ItemId, Loadout } from '../item';

export interface EngineLoadout extends Loadout {
  readonly id: string;
}

export interface EngineState {
  readonly playerOne: EngineLoadout;
  readonly playerTwo: EngineLoadout;
  readonly turnQueue: string[];
  readonly turnError: number;
  readonly listeners: Listener[];
  readonly gameOver: boolean;
  readonly winnerId?: string;
}

export type StateChangeLogEntry = {
  type: 'state-change';
  snapshot: EngineState;
};

export type LogEntry =
  | { type: 'event'; event: GameEvent }
  | StateChangeLogEntry;

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
  | { type: 'effect'; effect: Effect; playerId: string };

// Type guards for GameEvent variants to avoid `any` casts when handling events
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

export interface TurnManagerInterface {
  readonly nextTurns: string[];

  getNextTurns(count: number): string[];

  advanceTurn(): void;

  refresh(
    playerOneSpeed: number,
    playerTwoSpeed: number,
    firstPlayerId: string,
  ): void;

  clone(): TurnManagerInterface;

  reset(firstPlayerId?: string): void;
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
