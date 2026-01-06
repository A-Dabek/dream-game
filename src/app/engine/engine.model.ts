import {Effect, ItemId, Loadout} from '../item';

export interface EngineLoadout extends Loadout {
  readonly id: string;
}

export interface EngineState {
  readonly playerOne: EngineLoadout;
  readonly playerTwo: EngineLoadout;
  readonly listeners: Listener[];
}

export type GameEvent =
  | { type: 'on_play'; playerId: string; itemId: ItemId }
  | { type: 'on_turn_end'; playerId: string }
  | (Effect & { actingPlayerId: string });

export interface Listener {
  readonly instanceId: string;
  readonly playerId: string;
  handle(event: GameEvent, state: EngineState): {
    event: GameEvent | GameEvent[] | void;
    nextListener: Listener | null;
  };
}
