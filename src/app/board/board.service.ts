import { Injectable, signal, computed, inject } from '@angular/core';
import { GameState, Player, TurnInfo, GameAction, GameActionType, GameActionResult, Item } from './board.model';
import { EngineService } from '../engine';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private readonly engineService = inject(EngineService);
  private gameStateSignal = signal<GameState | null>(null);
  private actionHistorySignal = signal<GameAction[]>([]);

  gameState = computed(() => this.gameStateSignal());

  playerHealth = computed(() => this.gameStateSignal()?.player.health ?? 0);

  opponentHealth = computed(() => this.gameStateSignal()?.opponent.health ?? 0);

  playerItems = computed(() => this.gameStateSignal()?.player.items ?? []);

  opponentItems = computed(() => this.gameStateSignal()?.opponent.items ?? []);

  currentTurn = computed(() => this.gameStateSignal()?.turnInfo);

  isGameOver = computed(() => this.gameStateSignal()?.isGameOver ?? false);

  currentPlayerId = computed(() => this.gameStateSignal()?.turnInfo.currentPlayerId);

  nextPlayerId = computed(() => this.gameStateSignal()?.turnInfo.nextPlayerId);

  actionHistory = computed(() => this.actionHistorySignal());

  initializeGame(gameState: GameState): void {
    // Calculate turn order based on speed - higher speed goes first
    const [currentPlayerId, nextPlayerId] = gameState.player.speed >= gameState.opponent.speed
      ? [gameState.player.id, gameState.opponent.id]
      : [gameState.opponent.id, gameState.player.id];

    const updatedGameState: GameState = {
      ...gameState,
      turnInfo: {
        currentPlayerId,
        nextPlayerId,
        turnQueue: [currentPlayerId, nextPlayerId]
      }
    };

    this.gameStateSignal.set(updatedGameState);
    this.actionHistorySignal.set([]);
    this.engineService.initializeGame(gameState.player, gameState.opponent);
  }

  updateGameState(newGameState: GameState): void {
    this.gameStateSignal.set(newGameState);
  }

  playItem(itemName: string, playerId: string): GameActionResult {
    const currentState = this.gameStateSignal();

    if (!currentState) {
      return {
        success: false,
        action: this.createAction(GameActionType.PLAY_ITEM, playerId, itemName),
        error: 'Game has not been initialized'
      };
    }

    if (currentState.isGameOver) {
      return {
        success: false,
        action: this.createAction(GameActionType.PLAY_ITEM, playerId, itemName),
        error: 'Game is already over'
      };
    }

    if (currentState.turnInfo.currentPlayerId !== playerId) {
      return {
        success: false,
        action: this.createAction(GameActionType.PLAY_ITEM, playerId, itemName),
        error: 'Not your turn'
      };
    }

    const player = this.getPlayerById(playerId, currentState);

    if (!player) {
      return {
        success: false,
        action: this.createAction(GameActionType.PLAY_ITEM, playerId, itemName),
        error: 'Player not found'
      };
    }

    const itemExists = player.items.some((item) => item.name === itemName);

    if (!itemExists) {
      return {
        success: false,
        action: this.createAction(GameActionType.PLAY_ITEM, playerId, itemName),
        error: `Item '${itemName}' not found in player's inventory`
      };
    }

    // Delegate item effect calculation to engine
    this.engineService.play(itemName);

    const action = this.createAction(GameActionType.PLAY_ITEM, playerId, itemName);
    this.actionHistorySignal.update((history) => [...history, action]);

    // Advance to next player's turn
    this.advanceTurn();

    return {
      success: true,
      action,
      newGameState: this.gameStateSignal() ?? undefined
    };
  }

  pass(playerId: string): GameActionResult {
    const currentState = this.gameStateSignal();

    if (!currentState) {
      return {
        success: false,
        action: this.createAction(GameActionType.PLAY_ITEM, playerId),
        error: 'Game has not been initialized'
      };
    }

    if (currentState.isGameOver) {
      return {
        success: false,
        action: this.createAction(GameActionType.PLAY_ITEM, playerId),
        error: 'Game is already over'
      };
    }

    if (currentState.turnInfo.currentPlayerId !== playerId) {
      return {
        success: false,
        action: this.createAction(GameActionType.PLAY_ITEM, playerId),
        error: 'Not your turn'
      };
    }

    // Advance to next player's turn
    this.advanceTurn();

    return {
      success: true,
      action: this.createAction(GameActionType.PLAY_ITEM, playerId),
      newGameState: this.gameStateSignal() ?? undefined
    };
  }

  surrender(playerId: string): GameActionResult {
    const currentState = this.gameStateSignal();

    if (!currentState) {
      return {
        success: false,
        action: this.createAction(GameActionType.SURRENDER, playerId),
        error: 'Game has not been initialized'
      };
    }

    if (currentState.isGameOver) {
      return {
        success: false,
        action: this.createAction(GameActionType.SURRENDER, playerId),
        error: 'Game is already over'
      };
    }

    const player = this.getPlayerById(playerId, currentState);

    if (!player) {
      return {
        success: false,
        action: this.createAction(GameActionType.SURRENDER, playerId),
        error: 'Player not found'
      };
    }

    const action = this.createAction(GameActionType.SURRENDER, playerId);
    this.actionHistorySignal.update((history) => [...history, action]);

    return {
      success: true,
      action,
      newGameState: currentState
    };
  }

  getOpponentId(playerId: string): string | null {
    const currentState = this.gameStateSignal();

    if (!currentState) {
      return null;
    }

    if (currentState.player.id === playerId) {
      return currentState.opponent.id;
    }

    if (currentState.opponent.id === playerId) {
      return currentState.player.id;
    }

    return null;
  }

  isPlayersTurn(playerId: string): boolean {
    return this.gameStateSignal()?.turnInfo.currentPlayerId === playerId;
  }

  playerHasItem(playerId: string, itemName: string): boolean {
    const player = this.getPlayerById(playerId, this.gameStateSignal());
    return player?.items.some((item) => item.name === itemName) ?? false;
  }

  getPlayerHealth(playerId: string): number | null {
    const player = this.getPlayerById(playerId, this.gameStateSignal());
    return player?.health ?? null;
  }

  resetGame(): void {
    this.gameStateSignal.set(null);
    this.actionHistorySignal.set([]);
  }

  private advanceTurn(): void {
    const currentState = this.gameStateSignal();
    if (!currentState) return;

    const updatedGameState: GameState = {
      ...currentState,
      turnInfo: {
        currentPlayerId: currentState.turnInfo.nextPlayerId,
        nextPlayerId: currentState.turnInfo.currentPlayerId,
        turnQueue: currentState.turnInfo.turnQueue
      }
    };

    this.gameStateSignal.set(updatedGameState);
  }

  private getPlayerById(playerId: string, gameState: GameState | null): Player | null {
    if (!gameState) {
      return null;
    }

    if (gameState.player.id === playerId) {
      return gameState.player;
    }

    if (gameState.opponent.id === playerId) {
      return gameState.opponent;
    }

    return null;
  }

  private createAction(
    type: GameActionType,
    playerId: string,
    itemName?: string
  ): GameAction {
    return {
      type,
      playerId,
      itemName,
      timestamp: Date.now()
    };
  }
}

