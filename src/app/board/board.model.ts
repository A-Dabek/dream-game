import { LogEntry } from '../engine/engine.model';
import { ItemId, Loadout } from '../item';
import { TurnEntry } from '@dream/turn-manager';
import { Board } from './impl/board';

/**
 * Represents a player's loadout with a unique identifier.
 */
export interface BoardLoadout extends Loadout {
  readonly id: string;
}

/**
 * Tracks the current and upcoming turn sequence.
 */
export interface TurnInfo {
  currentPlayerId: string;
  nextPlayerId: string;
  turnQueue: TurnEntry[];
}

/**
 * Complete snapshot of the game state including players, turns, and action history.
 */
export interface GameState {
  player: BoardLoadout;
  opponent: BoardLoadout;
  turnInfo: TurnInfo;
  isGameOver: boolean;
  winnerId?: string;
  actionHistory: GameAction[];
}

/**
 * Supported game actions a player can perform.
 */
export enum GameActionType {
  PLAY_ITEM = 'PLAY_ITEM',
  SURRENDER = 'SURRENDER',
}

/**
 * Represents a single action performed during the game.
 */
export interface GameAction {
  type: GameActionType;
  playerId: string;
  itemId?: string;
}

/**
 * Result of executing a game action, including success status and updated state.
 */
export interface GameActionResult {
  success: boolean;
  action: GameAction;
  error?: string;
  newGameState?: GameState;
}

/**
 * Main board interface for managing game state, actions, and player turns.
 */
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
