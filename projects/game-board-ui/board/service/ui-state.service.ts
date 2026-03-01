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
  ListenerData,
  LogEntry,
  StateChangeLogEntry,
  StatusEffectData,
} from '@dream/game-board';
import { GameService } from '../../game-logic';
import { ActionHistoryEntry } from '../action-history-entry';
import { ItemConventionRegistry } from '../../common';
import { SoundService } from './sound.service';
import { StatusEffectDisplayData } from '../status-effects-display-data';

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
    this.logSubscription.unsubscribe();
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
    const pathD =
      action.itemId != null
        ? ItemConventionRegistry.getItemDisplay(action.itemId as ItemId).pathD
        : ItemConventionRegistry.PASS_ICON_PATH;

    // Look up genre from item registry if itemId is present
    let genre: Genre | undefined;
    if (action.itemId != null) {
      genre = getItemGenre(action.itemId as ItemId);
    }

    return {
      id: `history-${Math.random().toString(36).slice(2, 10)}`,
      actionType: action.type,
      playerId: action.playerId,
      pathD,
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

  private mapListenerToDisplayData(
    listener: ListenerData,
  ): StatusEffectDisplayData {
    const effectType = listener.effectState.effect.type;
    const duration = listener.effectState.currentDuration;
    const hasCharges = duration.type === 'turns' || duration.type === 'charges';
    const pathD =
      ItemConventionRegistry.getStatusEffectDisplay(effectType).pathD;
    const genre = listener.effectState.effect.genre;

    return {
      instanceId: listener.instanceId,
      type: effectType,
      remainingCharges: hasCharges ? duration.remaining : null,
      durationType: duration.type,
      pathD,
      genre,
    };
  }

  private applyStateChangeLog(
    state: GameState,
    log: StateChangeLogEntry,
  ): number {
    const { playerOne, playerTwo, listeners, turnQueue, gameOver, winnerId } =
      log.snapshot;

    const { playerStatusEffects, opponentStatusEffects } = listeners.reduce(
      (acc, listener) => {
        const displayData = this.mapListenerToDisplayData(listener);
        if (listener.playerId === playerOne.id) {
          acc.playerStatusEffects.push(displayData);
        } else if (listener.playerId === playerTwo.id) {
          acc.opponentStatusEffects.push(displayData);
        }
        return acc;
      },
      {
        playerStatusEffects: [] as StatusEffectDisplayData[],
        opponentStatusEffects: [] as StatusEffectDisplayData[],
      },
    );

    const nextState: GameState = {
      ...state,
      turnInfo: {
        turnQueue,
        currentPlayerId: turnQueue[0].playerId,
        nextPlayerId: turnQueue[1].playerId,
      },
      player: {
        ...state.player,
        health: playerOne.health,
        items: playerOne.items,
      },
      opponent: {
        ...state.opponent,
        health: playerTwo.health,
        items: playerTwo.items,
      },
      isGameOver: gameOver ?? state.isGameOver,
      winnerId: winnerId ?? state.winnerId,
      playerStatusEffects: playerStatusEffects as StatusEffectData[],
      opponentStatusEffects: opponentStatusEffects as StatusEffectData[],
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
