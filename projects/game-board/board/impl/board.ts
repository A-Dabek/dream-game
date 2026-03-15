import { Engine, LogEntry } from '../../engine';
import { ItemId } from '../../item';
import {
  BoardInterface,
  BoardLoadout,
  GameActionResult,
  GameActionType,
  GameState,
} from '../board.model';

export class Board implements BoardInterface {
  private readonly engine: Engine;

  constructor(player: BoardLoadout, opponent: BoardLoadout) {
    this._gameState = {
      player,
      opponent,
      turnInfo: {
        currentPlayerId: '',
        nextPlayerId: '',
        turnQueue: [],
      },
      isGameOver: false,
      actionHistory: [],
      playerStatusEffects: [],
      opponentStatusEffects: [],
    };

    this.engine = new Engine({ ...player }, { ...opponent });
    this.engine.processGameStart();

    this._gameState = this.syncWithEngine(this.engine, this._gameState);
    this.engine.processTurnStart(this._gameState.turnInfo.currentPlayerId);
  }

  private _gameState: GameState;

  get gameState(): GameState {
    return this._gameState;
  }

  get isGameOver(): boolean {
    return this._gameState.isGameOver;
  }

  get playerHealth(): number {
    return this._gameState.player.health;
  }

  get opponentHealth(): number {
    return this._gameState.opponent.health;
  }

  get currentPlayerId(): string {
    return this._gameState.turnInfo.currentPlayerId;
  }

  get nextPlayerId(): string {
    return this._gameState.turnInfo.nextPlayerId;
  }

  playItem(itemId: ItemId, playerId: string): GameActionResult {
    this.validateAction(playerId, GameActionType.PLAY_ITEM, itemId);

    this.engine.play(playerId, itemId);
    this.engine.processEndOfTurn(playerId);

    const nextGameState = this.syncWithEngine(this.engine, this._gameState);
    const action = {
      type: GameActionType.PLAY_ITEM,
      playerId,
      itemId,
    };

    this._gameState = {
      ...nextGameState,
      actionHistory: [...nextGameState.actionHistory, action],
    };

    return {
      success: true,
      action,
      newGameState: this._gameState,
    };
  }

  pass(playerId: string): GameActionResult {
    this.validateAction(playerId, GameActionType.PLAY_ITEM);

    this.engine.processEndOfTurn(playerId);

    const action = {
      type: GameActionType.PLAY_ITEM,
      playerId,
      itemId: undefined,
    };
    const nextGameState = this.syncWithEngine(this.engine, this._gameState);

    this._gameState = {
      ...nextGameState,
      actionHistory: [...nextGameState.actionHistory, action],
    };

    return { success: true, action, newGameState: this._gameState };
  }

  consumeLog(): LogEntry[] {
    return this.engine.consumeLog();
  }

  surrender(playerId: string): GameActionResult {
    this.validateAction(playerId, GameActionType.SURRENDER);

    const winnerId =
      this._gameState.player.id === playerId
        ? this._gameState.opponent.id
        : this._gameState.player.id;

    const nextGameState: GameState = {
      ...this._gameState,
      isGameOver: true,
      winnerId,
    };

    const action = {
      type: GameActionType.SURRENDER,
      playerId,
      itemId: undefined,
    };

    this._gameState = {
      ...nextGameState,
      actionHistory: [...nextGameState.actionHistory, action],
    };

    return { success: true, action, newGameState: this._gameState };
  }

  clone(): Board {
    const clonedBoard = Object.create(Board.prototype);
    const state = this._gameState;

    // Fast manual clone of the board's game state
    clonedBoard._gameState = {
      player: {
        ...state.player,
        items: state.player.items.map((i) => ({ ...i })),
      },
      opponent: {
        ...state.opponent,
        items: state.opponent.items.map((i) => ({ ...i })),
      },
      turnInfo: {
        ...state.turnInfo,
        turnQueue: state.turnInfo.turnQueue.map((t) => ({ ...t })),
      },
      isGameOver: state.isGameOver,
      winnerId: state.winnerId,
      actionHistory: state.actionHistory.map((a) => ({ ...a })),
      playerStatusEffects: state.playerStatusEffects.map((e) => ({ ...e })),
      opponentStatusEffects: state.opponentStatusEffects.map((e) => ({ ...e })),
    };

    // Optimization: Create a new engine instance and reset it to the current state
    const clonedEngine = new Engine(state.player, state.opponent);
    clonedEngine.reset(this.engine.state);

    // Manually initialize the readonly engine field for the cloned instance
    Object.defineProperty(clonedBoard, 'engine', {
      value: clonedEngine,
      writable: false,
      configurable: true,
    });

    return clonedBoard;
  }

  private validateAction(
    playerId: string,
    type: GameActionType,
    itemId?: ItemId,
  ): void {
    if (this._gameState.isGameOver) {
      throw new Error('Game is already over');
    }

    const player =
      this._gameState.player.id === playerId
        ? this._gameState.player
        : this._gameState.opponent.id === playerId
          ? this._gameState.opponent
          : null;
    if (!player) {
      throw new Error('Player not found');
    }

    if (this._gameState.turnInfo.currentPlayerId !== playerId) {
      throw new Error('Not your turn');
    }

    if (type === GameActionType.PLAY_ITEM && itemId) {
      const hasItem = player.items.some((item) => item.id === itemId);
      if (!hasItem) {
        throw new Error(`Item '${itemId}' not found in player's inventory`);
      }
    }
  }

  private syncWithEngine(engine: Engine, state: GameState): GameState {
    const engineState = engine.state;
    const isActingPlayerOne = engineState.playerOne.id === state.player.id;
    const updatedPlayer = isActingPlayerOne
      ? engineState.playerOne
      : engineState.playerTwo;
    const updatedOpponent = isActingPlayerOne
      ? engineState.playerTwo
      : engineState.playerOne;

    const isGameOver = engineState.gameOver;
    const winnerId = engineState.winnerId;

    // Map listeners to status effects for both players
    const playerStatusEffects = [];
    const opponentStatusEffects = [];

    for (const listener of engineState.listeners) {
      const effectData = {
        instanceId: listener.instanceId,
        type: listener.effectState.effect.type,
        remainingCharges:
          listener.effectState.currentDuration.remaining || null,
        durationType: listener.effectState.currentDuration.type,
        genre: listener.effectState.effect.genre,
      };

      if (listener.playerId === updatedPlayer.id) {
        playerStatusEffects.push(effectData);
      } else if (listener.playerId === updatedOpponent.id) {
        opponentStatusEffects.push(effectData);
      }
    }

    return {
      ...state,
      player: {
        ...state.player,
        health: updatedPlayer.health,
        items: updatedPlayer.items,
        speed: updatedPlayer.speed,
      },
      opponent: {
        ...state.opponent,
        health: updatedOpponent.health,
        items: updatedOpponent.items,
        speed: updatedOpponent.speed,
      },
      turnInfo: {
        currentPlayerId: engineState.turnQueue[0].playerId,
        nextPlayerId: engineState.turnQueue[1].playerId,
        turnQueue: engineState.turnQueue,
      },
      isGameOver: isGameOver ?? state.isGameOver,
      winnerId: winnerId ?? state.winnerId,
      playerStatusEffects,
      opponentStatusEffects,
    };
  }
}
