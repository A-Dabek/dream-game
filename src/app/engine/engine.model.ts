import {Effect, ItemId, Loadout} from '../item';
import {PassiveInstance} from './effects';

export interface EngineLoadout extends Loadout {
  readonly id: string;
  readonly endOfTurnEffects: Effect[];
}

export interface EngineState {
  readonly playerOne: EngineLoadout;
  readonly playerTwo: EngineLoadout;
  readonly passiveEffects: PassiveInstance[];
}

export type LifecycleEvent =
  | { type: 'on_play'; actingPlayerId: string; itemId: ItemId }
  | { type: 'before_effect'; actingPlayerId: string; effect: Effect }
  | { type: 'after_effect'; actingPlayerId: string; effect: Effect }
  | { type: 'on_turn_end'; actingPlayerId: string };
