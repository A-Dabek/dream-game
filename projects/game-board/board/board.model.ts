import { LogEntry } from '../engine/engine.model';
import { ItemId, Loadout, StatusEffectType } from '../item';
import { TurnEntry } from '../turn-manager';
import { Board } from './impl/board';

export interface StatusEffectDisplayData {
  readonly instanceId: string;
  readonly type: StatusEffectType;
  readonly remainingCharges: number | null;
  readonly durationType:
    | 'turns'
    | 'charges'
    | 'permanent'
    | 'until_item_removed';
}

export interface BoardLoadout extends Loadout {
  readonly id: string;
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
  playerStatusEffects: StatusEffectDisplayData[];
  opponentStatusEffects: StatusEffectDisplayData[];
}

export enum GameActionType {
  PLAY_ITEM = 'PLAY_ITEM',
  SURRENDER = 'SURRENDER',
}

export interface GameAction {
  type: GameActionType;
  playerId: string;
  itemId?: string;
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
