import { Genre } from '@dream/shared-basic';
import { type GameAction, GameActionType, LogEntry } from '../engine';
import { Duration, ItemId, Loadout, StatusEffectType } from '../item';
import { TurnEntry } from '../turn-manager';
import { Board } from './impl/board';

export type { GameAction };
export { GameActionType };

export interface StatusEffectData {
  instanceId: string;
  type: StatusEffectType;
  remainingCharges: number | null;
  durationType: Duration['type'];
  genre: Genre;
}

export interface BoardLoadout extends Loadout {
  id: string;
  maxHealth: number;
}

export interface TurnInfo {
  currentPlayerId: string;
  nextPlayerId: string;
  turnQueue: TurnEntry[];
}

export interface GameState {
  player: BoardLoadout;
  opponent: BoardLoadout;
  turnInfo: TurnInfo;
  isGameOver: boolean;
  winnerId?: string;
  actionHistory: GameAction[];
  playerStatusEffects: StatusEffectData[];
  opponentStatusEffects: StatusEffectData[];
}

export interface GameActionResult {
  success: boolean;
  action: GameAction;
  error?: string;
  newGameState?: GameState;
}

export interface BoardInterface {
  readonly gameState: GameState;
  readonly isGameOver: boolean;
  readonly playerHealth: number;
  readonly opponentHealth: number;
  readonly currentPlayerId: string;
  readonly nextPlayerId: string;

  playItem(itemId: ItemId, playerId: string): GameActionResult;

  pass(playerId: string): GameActionResult;

  consumeLog(): LogEntry[];

  surrender(playerId: string): GameActionResult;

  clone(): Board;
}
