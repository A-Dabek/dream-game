import {Effect, ItemId, Loadout} from '../item';

export interface EngineLoadout extends Loadout {
  readonly id: string;
}

export interface EngineState {
  readonly playerOne: EngineLoadout;
  readonly playerTwo: EngineLoadout;
  readonly listeners: Listener[];
}

export type LogEntry =
  | { type: 'event'; event: GameEvent }
  | { type: 'reaction'; instanceId: string; playerId: string; event: GameEvent }
  | { type: 'processor'; effect: Effect; targetPlayerId: string };

export type GameEvent =
  | { type: 'on_play'; playerId: string; itemId: ItemId }
  | { type: 'on_turn_end'; playerId: string }
  | (Effect & { playerId: string });

export interface Listener {
  readonly instanceId: string;
  readonly playerId: string;
  handle(event: GameEvent, state: EngineState): {
    event: GameEvent[];
  };
}
