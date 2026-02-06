import { computed, inject, Injectable, signal } from '@angular/core';
import { GameService } from '@dream/game';
import { concatMap, delay, from, Subscription } from 'rxjs';
import { GameState } from '../board';
import { isLifecycleGameEvent, LogEntry } from '../engine/engine.model';

@Injectable({
  providedIn: 'root',
})
export class UiStateService {
  private readonly gameService = inject(GameService);
  private readonly _uiState = signal<GameState | null>(null);
  readonly uiState = computed(() => this._uiState());
  private logSubscription = new Subscription();

  initialize(initialState: GameState): void {
    this._uiState.set(JSON.parse(JSON.stringify(initialState)));
    this.logSubscription = this.gameService.logs$
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
        concatMap((log) => from([log]).pipe(delay(500))),
      )
      .subscribe((log) => {
        if (log.type === 'end_of_batch') {
          this.checkValidation(log.state);
          return;
        }
        this.applyLog(log);
      });
  }

  private applyLog(log: LogEntry): void {
    const state = this._uiState();
    if (!state) return;

    const nextState = JSON.parse(JSON.stringify(state)) as GameState;

    if (
      log.type === 'event' &&
      isLifecycleGameEvent(log.event) &&
      log.event.phase === 'on_turn_end'
    ) {
      const queue = nextState.turnInfo.turnQueue || [];
      if (queue.length > 0) {
        nextState.turnInfo.currentPlayerId = queue[1];
        nextState.turnInfo.nextPlayerId = queue[2];
        nextState.turnInfo.turnQueue = queue.slice(1);
      }
    }

    if (
      log.type === 'event' &&
      isLifecycleGameEvent(log.event) &&
      log.event.phase === 'game_over'
    ) {
      nextState.isGameOver = true;
      nextState.winnerId = log.event.playerId;
      this.logSubscription.unsubscribe();
    }

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
