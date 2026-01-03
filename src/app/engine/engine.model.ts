import {Loadout} from '../item';

export interface EngineLoadout extends Loadout {
  readonly id: string;
  readonly damageMultiplier: number;
}

export interface EngineState {
  readonly playerOne: EngineLoadout;
  readonly playerTwo: EngineLoadout;
}

