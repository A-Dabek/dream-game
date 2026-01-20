import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { concatMap, delay, from } from 'rxjs';
import { GameState } from '../board';
import { LogEntry } from '../engine/engine.model';
import { GameService } from '../game/game.service';

@Injectable({
  providedIn: 'root',
})
export class UiStateService {
  private readonly gameService = inject(GameService);
  private readonly _uiState = signal<GameState | null>(null);
  readonly uiState = computed(() => this._uiState());

  constructor() {
    this.gameService.logs$
      .pipe(
        concatMap((logs) => from(logs)),
        concatMap((log) => from([log]).pipe(delay(500))),
        takeUntilDestroyed(),
      )
      .subscribe((log) => {
        console.log(log);
        this.applyLog(log);

        const state = this._uiState();
        const engineState = this.gameService.gameState();
        if (
          state &&
          engineState &&
          state.turnInfo.currentPlayerId === engineState.player.id
        ) {
          this.checkValidation(log);
        }
      });
  }

  initialize(initialState: GameState): void {
    this._uiState.set(JSON.parse(JSON.stringify(initialState)));
  }

  private applyLog(log: LogEntry): void {
    const state = this._uiState();
    if (!state) return;

    const nextState = { ...state };

    if (log.type === 'processor') {
      const { effect, targetPlayerId } = log;
      const isPlayer = state.player.id === targetPlayerId;
      const target = isPlayer ? nextState.player : nextState.opponent;

      switch (effect.type) {
        case 'damage':
          target.health -= effect.value as number;
          break;
        case 'healing':
          target.health += effect.value as number;
          break;
        case 'remove_item': {
          const itemIndex = target.items.findIndex(
            (item) => item.instanceId === (effect.value as string),
          );
          if (itemIndex !== -1) {
            const updatedItems = [...target.items];
            updatedItems.splice(itemIndex, 1);
            if (isPlayer) {
              nextState.player = { ...nextState.player, items: updatedItems };
            } else {
              nextState.opponent = {
                ...nextState.opponent,
                items: updatedItems,
              };
            }
          }
          break;
        }
      }

      if (nextState.player.health <= 0 || nextState.opponent.health <= 0) {
        nextState.isGameOver = true;
        nextState.winnerId =
          nextState.player.health > 0
            ? nextState.player.id
            : nextState.opponent.id;
      }
    }

    this._uiState.set(nextState);
  }

  private checkValidation(log: LogEntry): void {
    const state = this._uiState();
    const engineState = this.gameService.gameState();

    if (!state || !engineState) return;

    if (log.type === 'event' && log.event.type === 'on_turn_end') {
      state.turnInfo = { ...engineState.turnInfo };
    }

    this.validateStates(state, engineState);
  }

  private validateStates(ui: GameState, engine: GameState): void {
    const mismatches: string[] = [];

    if (ui.player.health !== engine.player.health) {
      mismatches.push('player.health');
    }
    if (ui.opponent.health !== engine.opponent.health) {
      mismatches.push('opponent.health');
    }
    if (ui.player.items.length !== engine.player.items.length) {
      mismatches.push('player.items.length');
    }
    if (ui.opponent.items.length !== engine.opponent.items.length) {
      mismatches.push('opponent.items.length');
    }
    if (ui.isGameOver !== engine.isGameOver) {
      mismatches.push('isGameOver');
    }
    if (ui.winnerId !== engine.winnerId) {
      mismatches.push('winnerId');
    }

    if (mismatches.length > 0) {
      console.error('State Mismatch!', { mismatches, ui, engine });
      throw new Error(
        `UI state is not synchronized with engine state. Mismatched properties: ${mismatches.join(', ')}`,
      );
    }
  }
}
