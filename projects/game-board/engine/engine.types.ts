export type { ListenerData } from './effects/listener-factory';
import { Effect, ItemId, Loadout } from '../item';
import { TurnEntry } from '../turn-manager';
import { ListenerData } from './effects/listener-factory';

export interface EngineLoadout extends Loadout {
  readonly id: string;
}

export interface Listener {
  handle(
    event: GameEvent,
    state: EngineState,
    data: ListenerData,
  ): {
    event: GameEvent[];
    data: ListenerData;
  };
  canPossiblyReact(event: GameEvent, data: ListenerData): boolean;
}

export enum GameActionType {
  PLAY_ITEM = 'PLAY_ITEM',
  SURRENDER = 'SURRENDER',
}

export interface GameAction {
  type: GameActionType;
  playerId: string;
  itemId?: ItemId;
}

export interface EngineState {
  playerOne: EngineLoadout;
  playerTwo: EngineLoadout;
  turnQueue: TurnEntry[];
  listeners: ListenerData[];
  gameOver: boolean;
  winnerId?: string;
  actionHistory: GameAction[];
}

export type LifecyclePhase =
  | 'game_start'
  | 'on_turn_start'
  | 'on_turn_end'
  | 'game_over';

export enum GameEventStatus {
  NEW = 0,
  PROGRESS = 1,
  DONE = 2,
  NULLIFY = -1,
  NULLIFIED = -2,
}

export type GameEvent = (
  | { type: 'on_play'; itemId: ItemId }
  | { type: 'lifecycle'; phase: LifecyclePhase }
  | { type: 'effect'; effect: Effect }
) & {
  playerId: string;
  processedBy: string[];
  status: GameEventStatus;
};

export type GameEventInput = (
  | { type: 'on_play'; itemId: ItemId }
  | { type: 'lifecycle'; phase: LifecyclePhase }
  | { type: 'effect'; effect: Effect }
) & {
  playerId: string;
  processedBy?: string[];
  status?: GameEventStatus;
};

export type LifecycleGameEvent = GameEvent & { type: 'lifecycle' };

export type StateChangeLogEntry = {
  type: 'state-change';
  snapshot: EngineState;
};

export type LogEntry =
  | { type: 'event'; event: GameEvent }
  | StateChangeLogEntry;

export type ProcessorType =
  | 'damage'
  | 'healing'
  | 'speed_up'
  | 'slow_down'
  | 'remove_item'
  | 'remove_listener'
  | 'advance_turn'
  | 'add_status_effect';
