import { inject } from '@angular/core';
import { filter, firstValueFrom } from 'rxjs';
import { Strategy } from '../ai';
import { Board, GameAction } from '../board';
import { HumanInputService } from './human-input.service';

/**
 * Strategy for human players that waits for UI input via HumanInputService.
 */
export class HumanStrategy implements Strategy {
  private readonly inputService = inject(HumanInputService);

  /**
   * Decides the next action by waiting for an action from HumanInputService.
   */
  async decide(board: Board): Promise<GameAction> {
    const currentPlayerId = board.currentPlayerId;

    // Wait for the first action that belongs to the current player
    return firstValueFrom(
      this.inputService.actions$.pipe(
        filter((action) => action.playerId === currentPlayerId),
      ),
    );
  }
}
