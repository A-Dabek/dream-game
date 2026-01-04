import {ItemEffect, ItemId, Loadout, PassiveEffect} from '../item';

export interface RegisteredPassiveEffect {
  readonly playerId: string;
  readonly itemId: ItemId;
  readonly instanceId: string;
  readonly effect: PassiveEffect;
  readonly remainingCharges?: number;
  readonly remainingTurns?: number;
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

