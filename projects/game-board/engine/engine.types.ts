import { Effect, ItemId, Loadout } from '../item';
import { TurnEntry } from '../turn-manager';
import { StatusEffect } from '../item';

export interface EngineLoadout extends Loadout {
  readonly id: string;
}

export interface ListenerData {
  readonly instanceId: string;
  readonly playerId: string;
  readonly effectState: {
    readonly effect: StatusEffect;
    readonly currentDuration: {
      readonly type: 'turns' | 'charges' | 'permanent' | 'until_item_removed';
      readonly remaining: number;
    };
  };
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
}

export interface EngineState {
  readonly playerOne: EngineLoadout;
  readonly playerTwo: EngineLoadout;
  readonly turnQueue: TurnEntry[];
  readonly listeners: Listener[];
  readonly gameOver: boolean;
  readonly winnerId?: string;
}

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
