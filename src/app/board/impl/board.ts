import { Engine } from '@dream/engine';
import { LogEntry } from '../../engine/engine.model';
import { ItemId } from '@dream/item';
import {
  BoardInterface,
  BoardLoadout,
  GameActionResult,
  GameActionType,
  GameState,
} from '../board.model';
import { TurnManager } from './turn-manager';

export class Board implements BoardInterface {
  private _gameState: GameState;
  private turnManager: TurnManager;
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
    };

    this.turnManager = new TurnManager(
      { id: player.id, speed: player.speed },
      { id: opponent.id, speed: opponent.speed },
    );

    this.engine = new Engine({ ...player }, { ...opponent });
    this.engine.processGameStart();

    this._gameState = this.updateTurnInfo(this._gameState);
    this.engine.processTurnStart(this._gameState.turnInfo.currentPlayerId);
  }

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

    let nextGameState = this.syncWithEngine(this.engine, this._gameState);
    const action = {
      type: GameActionType.PLAY_ITEM,
      playerId,
      itemId,
    };

    nextGameState = this.advanceTurn(nextGameState);

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
    let nextGameState = this.syncWithEngine(this.engine, this._gameState);
    nextGameState = this.advanceTurn(nextGameState);

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
    const clonedBoard = new Board(
      JSON.parse(JSON.stringify(this._gameState.player)),
      JSON.parse(JSON.stringify(this._gameState.opponent)),
    );
    clonedBoard._gameState = JSON.parse(JSON.stringify(this._gameState));
    clonedBoard.turnManager = this.turnManager.clone();
    return clonedBoard;
  }

  private updateTurnInfo(state: GameState): GameState {
    const turns = this.turnManager.getNextTurns(2);
    return {
      ...state,
      turnInfo: {
        ...state.turnInfo,
        currentPlayerId: turns[0],
        nextPlayerId: turns[1],
        turnQueue: this.turnManager.getNextTurns(10),
      },
    };
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
    const engineState = engine.state();
    const isActingPlayerOne = engineState.playerOne.id === state.player.id;
    const updatedPlayer = isActingPlayerOne
      ? engineState.playerOne
      : engineState.playerTwo;
    const updatedOpponent = isActingPlayerOne
      ? engineState.playerTwo
      : engineState.playerOne;

    const isGameOver = updatedPlayer.health <= 0 || updatedOpponent.health <= 0;
    const winnerId = isGameOver
      ? updatedPlayer.health > 0
        ? updatedPlayer.id
        : updatedOpponent.id
      : undefined;

    return {
      ...state,
      player: {
        ...state.player,
        health: updatedPlayer.health,
        items: updatedPlayer.items,
      },
      opponent: {
        ...state.opponent,
        health: updatedOpponent.health,
        items: updatedOpponent.items,
      },
      isGameOver: isGameOver ?? state.isGameOver,
      winnerId: winnerId ?? state.winnerId,
    };
  }

  private advanceTurn(state: GameState): GameState {
    this.turnManager.advanceTurn();
    const newTurns = this.turnManager.getNextTurns(1);
    this.engine.processTurnStart(newTurns[0]);
    return this.updateTurnInfo(state);
  }
}
