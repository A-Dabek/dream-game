import { Board, GameAction, GameActionType } from '@dream/board';
import { Strategy } from '../ai.model';

/**
 * Primitive strategy that always chooses the first (leftmost) available item.
 */
export class FirstAvailableStrategy implements Strategy {
  /**
   * Decides the next action to take for the current player on the given board.
   *
   * @param board The current game board.
   * @returns A promise that resolves to the chosen game action.
   */
  async decide(board: Board): Promise<GameAction> {
    // Clone the board to interact with it without modifying the original state
    const simulationBoard = board.clone();
    const state = simulationBoard.gameState;
    const currentPlayerId = state.turnInfo.currentPlayerId;

    const player =
      state.player.id === currentPlayerId ? state.player : state.opponent;

    // Primitive implementation: just play the first (leftmost) available item
    if (player.items.length > 0) {
      return {
        type: GameActionType.PLAY_ITEM,
        playerId: currentPlayerId,
        itemId: player.items[0].id,
      };
    }

    // Fallback: If no items are available, perform a 'pass' action.
    // In the current Board implementation, pass is represented as a PLAY_ITEM without an itemId.
    return {
      type: GameActionType.PLAY_ITEM,
      playerId: currentPlayerId,
    };
  }
}
