import { Injectable } from '@angular/core';
import { Board, GameAction, GameActionType } from '../board';
import { ItemId } from '../item';
import { Player } from '../player';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  /**
   * Starts a game between two players and runs the game loop until it's over.
   * Updates player ratings after the game concludes.
   *
   * @param player1 The first player.
   * @param player2 The second player.
   * @returns The board state after the game is over.
   */
  startGame(player1: Player, player2: Player): Board {
    const board = new Board(
      { ...player1.loadout, id: player1.id },
      { ...player2.loadout, id: player2.id },
    );

    // Basic game loop
    while (!board.isGameOver) {
      const currentPlayerId = board.currentPlayerId;
      const currentPlayer = currentPlayerId === player1.id ? player1 : player2;

      const action = currentPlayer.strategy.decide(board);
      this.executeAction(board, action);
    }

    this.updateRatings(board, player1, player2);

    return board;
  }

  /**
   * Executes a game action on the board.
   */
  private executeAction(board: Board, action: GameAction): void {
    switch (action.type) {
      case GameActionType.PLAY_ITEM:
        if (action.itemId) {
          board.playItem(action.itemId as ItemId, action.playerId);
        } else {
          board.pass(action.playerId);
        }
        break;
      case GameActionType.SURRENDER:
        board.surrender(action.playerId);
        break;
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
