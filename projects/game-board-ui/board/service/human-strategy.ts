import { inject, Injectable } from '@angular/core';
import { filter, firstValueFrom } from 'rxjs';
import { Board, GameAction, Strategy } from '@dream/game-board';
import { HumanInputService } from './human-input.service';

/**
 * Strategy for human players that waits for UI input via HumanInputService.
 */
@Injectable({ providedIn: 'root' })
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
