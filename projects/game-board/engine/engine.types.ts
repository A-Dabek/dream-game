import { Effect, ItemId, Loadout } from '../item';
import { TurnEntry } from '../turn-manager';
import { ListenerData } from './effects/listener-factory';

export interface EngineLoadout extends Loadout {
  readonly id: string;
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
  serialize(): ListenerData;
  canPossiblyReact(event: GameEvent): boolean;
  sync(data: ListenerData): void;
}

export interface EngineState {
  readonly playerOne: EngineLoadout;
  readonly playerTwo: EngineLoadout;
  readonly turnQueue: TurnEntry[];
  readonly listeners: ListenerData[];
  readonly gameOver: boolean;
  readonly winnerId?: string;
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

export type EffectProcessor = (
  state: EngineState,
  playerKey: 'playerOne' | 'playerTwo',
  effect: Effect,
) => EngineState;

export type Processors = Record<ProcessorType, EffectProcessor>;
