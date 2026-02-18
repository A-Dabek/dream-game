import { computed, inject, Injectable, signal } from '@angular/core';
import { concatMap, from, Subscription, timer } from 'rxjs';
import {
  GameAction,
  GameEvent,
  GameState,
  Genre,
  getItemGenre,
  Item,
  ItemId,
  LogEntry,
  StateChangeLogEntry,
} from '@dream/game-board';
import { GameService } from '../../game-logic';
import { ActionHistoryEntry } from '../action-history-entry';
import { ItemDisplayRegistry } from '../../common';
import { SoundService } from './sound.service';

@Injectable({
  providedIn: 'root',
})
export class UiStateService {
  private readonly defaultDelay = 200;
  private readonly gameService = inject(GameService);
  private readonly soundService = inject(SoundService);
  private readonly _uiState = signal<GameState | null>(null);
  readonly uiState = computed(() => this._uiState());
  private readonly _lastPlayedItem = signal<Item | null>(null);
  readonly lastPlayedItem = computed(() => this._lastPlayedItem());
  private readonly actionHistoryLimit = 15;
  private readonly _actionHistory = signal<ActionHistoryEntry[]>([]);
  readonly actionHistory = computed(() => this._actionHistory());
  private lastObservedActionCount = 0;
  private logSubscription = new Subscription();

  initialize(initialState: GameState): void {
    this._uiState.set(JSON.parse(JSON.stringify(initialState)));
    this._lastPlayedItem.set(null);
    this._actionHistory.set([]);
    this.lastObservedActionCount = initialState.actionHistory?.length ?? 0;
    this.logSubscription = this.gameService.logs$
      .pipe(
        concatMap((logs) => from([...logs])),
        concatMap((log) => timer(this.applyLog(log))),
      )
      .subscribe();
  }

  private createHistoryEntry(action: GameAction): ActionHistoryEntry {
    const iconName =
      action.itemId != null && ItemDisplayRegistry.hasMetadata(action.itemId)
        ? ItemDisplayRegistry.getMetadata(action.itemId as ItemId).iconName
        : ItemDisplayRegistry.PASS_ICON_NAME;

    // Look up genre from item registry if itemId is present
    let genre: Genre | undefined;
    if (action.itemId != null) {
      genre = getItemGenre(action.itemId as ItemId);
    }

    return {
      id: `history-${Math.random().toString(36).slice(2, 10)}`,
      actionType: action.type,
      playerId: action.playerId,
      iconName,
      itemId: action.itemId,
      genre,
    };
  }

  private capturePendingActions(): void {
    const currentState = this.gameService.gameState();
    if (!currentState) {
      return;
    }

    const allActions = currentState.actionHistory ?? [];
    if (allActions.length <= this.lastObservedActionCount) {
      return;
    }

    let updatedHistory = [...this._actionHistory()];
    const newActions = allActions.slice(this.lastObservedActionCount);
    for (const action of newActions) {
      updatedHistory = [this.createHistoryEntry(action), ...updatedHistory];
      if (updatedHistory.length > this.actionHistoryLimit) {
        updatedHistory = updatedHistory.slice(0, this.actionHistoryLimit);
      }
    }

    this._actionHistory.set(updatedHistory);
    this.lastObservedActionCount = allActions.length;
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

    this.capturePendingActions();

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

    this.soundService.playItemSound(event.itemId);

    // Look up genre from item registry
    const genre = getItemGenre(event.itemId);
    const lastPlayedItem: Item = { id: event.itemId, genre };
    this._lastPlayedItem.set(lastPlayedItem);
  }
}
