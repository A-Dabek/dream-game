import { Board, GameAction } from '@dream/board';

/**
 * Interface for AI decision-making strategies.
 */
export interface Strategy {
  /**
   * Decides the next action to take for the current player on the given board.
   *
   * @param board The current game board.
   * @returns A promise that resolves to the chosen game action.
   */
  decide(board: Board): Promise<GameAction>;
}
