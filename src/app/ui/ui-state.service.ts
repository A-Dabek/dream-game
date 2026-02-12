import { computed, inject, Injectable, signal } from '@angular/core';
import { GameService } from '@dream/game';
import { concatMap, from, Subscription, timer } from 'rxjs';
import { GameState } from '../board';
import { Item } from '../item';
import {
  GameEvent,
  LogEntry,
  StateChangeLogEntry,
} from '../engine/engine.model';

@Injectable({
  providedIn: 'root',
})
export class UiStateService {
  private readonly defaultDelay = 200;
  private readonly gameService = inject(GameService);
  private readonly _uiState = signal<GameState | null>(null);
  readonly uiState = computed(() => this._uiState());
  private readonly _lastPlayedItem = signal<Item | null>(null);
  readonly lastPlayedItem = computed(() => this._lastPlayedItem());
  private logSubscription = new Subscription();

  initialize(initialState: GameState): void {
    this._uiState.set(JSON.parse(JSON.stringify(initialState)));
    this._lastPlayedItem.set(null);
    this.logSubscription = this.gameService.logs$
      .pipe(
        concatMap((logs) => from([...logs])),
        concatMap((log) => timer(this.applyLog(log))),
      )
      .subscribe();
  }

  private applyLog(log: LogEntry): number {
    const state = this._uiState();
    if (!state) return this.defaultDelay;

    let delay = this.defaultDelay;
    switch (log.type) {
      case 'state-change':
        delay = this.applyStateChangeLog(state, log as StateChangeLogEntry);
        break;
      case 'event':
        this.applyEventLog(log.event);
        break;
    }

    if (this._uiState()?.isGameOver) {
      this.logSubscription.unsubscribe();
    }

    return delay;
  }

  private applyStateChangeLog(
    state: GameState,
    log: StateChangeLogEntry,
  ): number {
    const nextState: GameState = {
      ...state,
      turnInfo: {
        turnQueue: log.snapshot.turnQueue,
        currentPlayerId: log.snapshot.turnQueue[0].playerId,
        nextPlayerId: log.snapshot.turnQueue[1].playerId,
      },
      player: {
        ...state.player,
        health: log.snapshot.playerOne.health,
        items: log.snapshot.playerOne.items,
      },
      opponent: {
        ...state.opponent,
        health: log.snapshot.playerTwo.health,
        items: log.snapshot.playerTwo.items,
      },
      isGameOver: log.snapshot.gameOver ?? state.isGameOver,
      winnerId: log.snapshot.winnerId ?? state.winnerId,
    };

    this._uiState.set(nextState);

    return this.defaultDelay;
  }

  private applyEventLog(event: GameEvent): void {
    if (event.type !== 'on_play' || !event.itemId) {
      return;
    }

    const lastPlayedItem: Item = { id: event.itemId };
    this._lastPlayedItem.set(lastPlayedItem);
  }
}
