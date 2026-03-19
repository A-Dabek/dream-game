import {
  Board,
  GameAction,
  GameActionResult,
  GameActionType,
  GameState,
} from '../board';
import { LogEntry } from '../engine';
import { ItemId } from '../item';
import { Player } from '../player';

/**
 * Orchestrates a game between two players.
 * This class is independent of any framework.
 */
export class GameOrchestrator {
  private _onGameStateChange?: (state: GameState) => void;
  private _onLogs?: (logs: LogEntry[]) => void;

  constructor(callbacks?: {
    onGameStateChange?: (state: GameState) => void;
    onLogs?: (logs: LogEntry[]) => void;
  }) {
    this._onGameStateChange = callbacks?.onGameStateChange;
    this._onLogs = callbacks?.onLogs;
  }

  /**
   * Starts a game and runs the game loop until completion.
   */
  async startGame(player1: Player, player2: Player): Promise<Board> {
    const players = [player1, player2];
    const board = new Board(
      { ...player1.loadout, id: player1.id, maxHealth: player1.loadout.health },
      { ...player2.loadout, id: player2.id, maxHealth: player2.loadout.health },
    );

    this._onGameStateChange?.(board.gameState);

    // Basic game loop
    while (!board.isGameOver) {
      // Emit logs for the UI to animate or display
      this._onLogs?.(board.consumeLog());

      const currentPlayerId = board.currentPlayerId;
      const currentPlayer = players.find((p) => p.id === currentPlayerId);

      if (!currentPlayer) {
        throw new Error(`Player with id ${currentPlayerId} not found`);
      }

      // Decide action asynchronously
      const action = await currentPlayer.strategy.decide(board.clone());

      const result = this.executeAction(board, action);
      if (!result.success) {
        throw new Error(
          `[GameOrchestrator] Action ${result.action.type} failed: ${result.error}`,
        );
      }

      // Emit the updated game state
      this._onGameStateChange?.(board.gameState);
    }
    this._onLogs?.(board.consumeLog());

    this.updateRatings(board, player1, player2);

    return board;
  }

  /**
   * Executes a game action on the board.
   */
  private executeAction(board: Board, action: GameAction): GameActionResult {
    switch (action.type) {
      case GameActionType.PLAY_ITEM:
        if (action.itemId) {
          return board.playItem(action.itemId as ItemId, action.playerId);
        } else {
          return board.pass(action.playerId);
        }
      case GameActionType.SURRENDER:
        return board.surrender(action.playerId);
      default:
        throw new Error(`Unsupported action type: ${action.type}`);
    }
  }

  /**
   * Updates player ratings based on the game result.
   */
  private updateRatings(board: Board, player1: Player, player2: Player): void {
    const winnerId = board.gameState.winnerId;
    if (!winnerId) {
      return;
    }

    const rating1 = player1.rating.value;
    const rating2 = player2.rating.value;
    if (winnerId === player1.id) {
      player1.rating.win(rating2);
      player2.rating.lose(rating1);
    } else if (winnerId === player2.id) {
      player2.rating.win(rating1);
      player1.rating.lose(rating2);
    }
  }
}
