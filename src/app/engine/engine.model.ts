import {ItemEffect, ItemId, Loadout, PassiveEffect} from '../item';

export interface RegisteredPassiveEffect {
  readonly playerId: string;
  readonly itemId: ItemId;
  readonly instanceId: string;
  readonly effect: PassiveEffect;
}

export interface EngineLoadout extends Loadout {
  readonly id: string;
  readonly endOfTurnEffects: ItemEffect[];
}

export interface EngineState {
  readonly playerOne: EngineLoadout;
  readonly playerTwo: EngineLoadout;
  readonly passiveEffects: RegisteredPassiveEffect[];
}

