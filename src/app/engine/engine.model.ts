import {Loadout} from '../item';

export interface EnginePlayer extends Loadout {
  readonly id: string;
}

export interface EngineState {
  readonly playerOne: EnginePlayer;
  readonly playerTwo: EnginePlayer;
}

