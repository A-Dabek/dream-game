import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { IconName, Item } from '@dream/shared-basic';
import { concatMap, from, Subscription, timer } from 'rxjs';
import {
  GameAction,
  GameActionType,
  GameEvent,
  GameState,
  getItemGenre,
  ItemId,
  LogEntry,
  StateChangeLogEntry,
} from '@dream/game-board';
import { GameService } from '../../game-logic';
import { ActionHistoryEntry } from '../action-history-entry';
import { ItemConventionRegistry } from '../../common';
import { SoundService } from './sound.service';
import { UiGameState } from '../ui-game-state';
import { mapEngineStateToUiState, mapToUiState } from '../ui-state-mapper';

@Injectable()
export class UiStateService implements OnDestroy {
  private static readonly delayStorageKey = 'dream-game:delay';
  private readonly defaultDelay = 200;
  private cachedDelay: number | null = null;
  private readonly gameService = inject(GameService);
  private readonly soundService = inject(SoundService);
  private readonly _uiState = signal<UiGameState | null>(null);
  readonly uiState = computed(() => this._uiState());
  private readonly _lastPlayedItem = signal<Item | null>(null);
  readonly lastPlayedItem = computed(() => this._lastPlayedItem());
  private readonly actionHistoryLimit = 15;
  private readonly _actionHistory = signal<ActionHistoryEntry[]>([]);
  readonly actionHistory = computed(() => this._actionHistory());
  private lastObservedActionCount = 0;
  private logSubscription = new Subscription();

  private getDelayFromConfig(): number {
    if (this.cachedDelay !== null) {
      return this.cachedDelay;
    }

    const stored = localStorage.getItem(UiStateService.delayStorageKey);

    if (stored === null) {
      this.cachedDelay = this.defaultDelay;
    } else {
      const parsed = parseInt(stored, 10);
      this.cachedDelay = isNaN(parsed) ? this.defaultDelay : parsed;
    }

    return this.cachedDelay;
  }

  initialize(initialState: GameState): void {
    this.logSubscription.unsubscribe();
    this.soundService.playBackground();
    this._uiState.set(mapToUiState(initialState));
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

  ngOnDestroy(): void {
    this.logSubscription.unsubscribe();
    this.soundService.stopBackground();
  }

  private createHistoryEntry(action: GameAction): ActionHistoryEntry {
    const itemId = action.itemId as ItemId | undefined;
    const convention = itemId
      ? ItemConventionRegistry.getItemConvention(itemId)
      : { name: 'Pass', icon: 'fast-forward-button' };

    const genre = itemId ? getItemGenre(itemId) : undefined;

    return {
      id: `history-${crypto.randomUUID().slice(0, 8)}`,
      name: convention.name,
      actionType: action.type,
      playerId: action.playerId,
      iconName: convention.icon as IconName,
      itemId,
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

    const newActions = allActions.slice(this.lastObservedActionCount);

    newActions.forEach((action) => {
      if (action.type === GameActionType.PLAY_ITEM && !action.itemId) {
        this.soundService.playPass();
      }
    });

    const newEntries = newActions.map((a) => this.createHistoryEntry(a));

    this._actionHistory.update((history) =>
      [...newEntries.reverse(), ...history].slice(0, this.actionHistoryLimit),
    );
    this.lastObservedActionCount = allActions.length;
  }

  private applyLog(log: LogEntry): number {
    const state = this._uiState();
    if (!state) return this.getDelayFromConfig();

    let delay = this.getDelayFromConfig();
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
    state: UiGameState,
    log: StateChangeLogEntry,
  ): number {
    this._uiState.set(mapEngineStateToUiState(log.snapshot, state));
    return this.getDelayFromConfig();
  }

  private applyEventLog(event: GameEvent): void {
    if (event.type !== 'on_play' || !event.itemId) {
      return;
    }

    this.soundService.playItemSound(event.itemId);

    const lastPlayedItem: Item = {
      id: event.itemId,
      genre: getItemGenre(event.itemId),
      remainingUsages: 1,
    };
    this._lastPlayedItem.set(lastPlayedItem);
  }
}
