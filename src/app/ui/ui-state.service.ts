import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { concatMap, delay, from, tap } from 'rxjs';
import { GameState } from '../board';
import { LogEntry } from '../engine/engine.model';
import { GameService } from '../game/impl/game.service';

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
        concatMap((logs) =>
          from([
            ...logs,
            {
              type: 'end_of_batch',
              state: { ...this.gameService.gameState() },
            },
          ] as const),
        ),
        concatMap((log) => from([log]).pipe(delay(2000))),
        takeUntilDestroyed(),
      )
      .subscribe((log) => {
        console.log(log, this._uiState(), this.gameService.gameState());
        if (log.type === 'end_of_batch') {
          this.checkValidation(log.state);
          return;
        }
        this.applyLog(log);
      });
  }

  initialize(initialState: GameState): void {
    this._uiState.set(JSON.parse(JSON.stringify(initialState)));
  }

  private applyLog(log: LogEntry): void {
    const state = this._uiState();
    if (!state) return;

    const nextState = JSON.parse(JSON.stringify(state)) as GameState;

    if (log.type === 'event' && log.event.type === 'on_turn_end') {
      const queue = nextState.turnInfo.turnQueue || [];
      if (queue.length > 0) {
        nextState.turnInfo.currentPlayerId = queue[1];
        nextState.turnInfo.nextPlayerId = queue[2];
        nextState.turnInfo.turnQueue = queue.slice(1);
      }
      console.log('Changing turn. New queue:', nextState.turnInfo.turnQueue);
    }

    if (log.type === 'processor') {
      const { effect, targetPlayerId } = log;
      const isPlayer = state.player.id === targetPlayerId;
      const target = isPlayer ? nextState.player : nextState.opponent;

      switch (effect.type) {
        case 'damage':
          console.log('Applying damage:', effect.value);
          target.health -= effect.value as number;
          break;
        case 'healing':
          console.log('Applying healing:', effect.value);
          target.health += effect.value as number;
          break;
        case 'remove_item': {
          console.log('Removing item:', effect.value);
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
        console.log('Game over detected');
        nextState.isGameOver = true;
        nextState.winnerId =
          nextState.player.health > 0
            ? nextState.player.id
            : nextState.opponent.id;
      }
    }

    this._uiState.set(nextState);
  }

  private checkValidation(engineState: GameState): void {
    const state = this._uiState();

    if (!state || !engineState) return;

    this.validateStates(state, engineState);

    // Sync nextPlayerId and turnQueue from engine to UI if currentPlayerId validation passed
    this._uiState.set({
      ...state,
      turnInfo: {
        ...state.turnInfo,
        turnQueue: engineState.turnInfo.turnQueue
          ? [...engineState.turnInfo.turnQueue]
          : undefined,
      },
    });
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
    if (ui.turnInfo.currentPlayerId !== engine.turnInfo.currentPlayerId) {
      mismatches.push('turnInfo.currentPlayerId');
    }

    if (mismatches.length > 0) {
      console.error('State Mismatch!', { mismatches, ui, engine });
      throw new Error(
        `UI state is not synchronized with engine state. Mismatched properties: ${mismatches.join(', ')}`,
      );
    }
  }
}
