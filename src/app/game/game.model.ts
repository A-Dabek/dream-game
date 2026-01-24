import { Signal } from '@angular/core';
import { Board, GameState } from '@dream/board';
import { Player } from '@dream/player';
import { Observable } from 'rxjs';
import { LogEntry } from '../engine/engine.model';

export interface GameServiceInterface {
  readonly gameState: Signal<GameState>;
  readonly logs$: Observable<LogEntry[]>;

  /**
   * Starts a game between two players and runs the game loop until it's over.
   * Updates player ratings after the game concludes.
   *
   * @param player1 The first player.
   * @param player2 The second player.
   * @returns The board state after the game is over.
   */
  startGame(player1: Player, player2: Player): Promise<Board>;
}
