import { Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import type { GameState } from '@dream/board';
import {
  Board,
  GameAction,
  GameActionResult,
  GameActionType,
} from '@dream/board';
import { LogEntry } from '../../engine/engine.model';
import { ItemId } from '@dream/item';
import { Player } from '@dream/player';
import { GameServiceInterface } from '../game.model';

@Injectable({
  providedIn: 'root',
})
export class GameService implements GameServiceInterface {
  private _gameState$ = new Subject<GameState>();
  private _logs$ = new Subject<LogEntry[]>();
  private _players: Player[] = [];

  readonly gameState = toSignal(
    this._gameState$.asObservable(),
  ) as Signal<GameState>;
  readonly logs$ = this._logs$.asObservable();

  async startGame(player1: Player, player2: Player): Promise<Board> {
    this._players = [player1, player2];
    const board = new Board(
      { ...player1.loadout, id: player1.id },
      { ...player2.loadout, id: player2.id },
    );

    this._gameState$.next(board.gameState);

    // Basic game loop
    while (!board.isGameOver) {
      const currentPlayerId = board.currentPlayerId;
      const currentPlayer = this._players.find((p) => p.id === currentPlayerId);

      if (!currentPlayer) {
        throw new Error(`Player with id ${currentPlayerId} not found`);
      }

      // Decide action asynchronously
      const action = await currentPlayer.strategy.decide(board.clone());

      const result = this.executeAction(board, action);
      if (!result.success) {
        throw new Error(
          `[GameService] Action ${result.action} failed: ${result.error}`,
        );
      }

      // Emit the updated game state
      this._gameState$.next(board.gameState);

      // Emit logs for the UI to animate or display
      const log = board.consumeLog();
      if (log.length > 0) {
        this._logs$.next(log);
      }
    }

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
