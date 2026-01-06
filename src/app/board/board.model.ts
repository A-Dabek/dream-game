import {LogEntry} from '../engine/engine.model';
import {Loadout} from '../item';

export interface BoardLoadout extends Loadout {
  readonly id: string;
}

export interface TurnInfo {
  currentPlayerId: string;
  nextPlayerId: string;
  turnQueue?: string[];
}

export interface GameState {
  player: BoardLoadout;
  opponent: BoardLoadout;
  turnInfo: TurnInfo;
  isGameOver: boolean;
  winnerId?: string;
  actionHistory: GameAction[];
}

export enum GameActionType {
  PLAY_ITEM = 'PLAY_ITEM',
  SURRENDER = 'SURRENDER'
}

export interface GameAction {
  type: GameActionType;
  playerId: string;
  itemId?: string;
  timestamp: number;
}

export interface GameActionResult {
  success: boolean;
  action: GameAction;
  error?: string;
  newGameState?: GameState;
  log?: LogEntry[];
}

