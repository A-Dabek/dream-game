import {ItemEffect, Loadout} from '../item';

export interface EngineLoadout extends Loadout {
  readonly id: string;
  readonly endOfTurnEffects: ItemEffect[];
}

export interface EngineState {
  readonly playerOne: EngineLoadout;
  readonly playerTwo: EngineLoadout;
}

