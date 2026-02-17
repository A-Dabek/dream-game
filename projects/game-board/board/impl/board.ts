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
    const clonedBoard = new Board(
      JSON.parse(JSON.stringify(this._gameState.player)),
      JSON.parse(JSON.stringify(this._gameState.opponent)),
    );
    clonedBoard._gameState = JSON.parse(JSON.stringify(this._gameState));
    // Since Engine is not easily clonable (it uses signals and private state),
    // and Board.clone() seems to be used for simulation, we might have a problem.
    // However, the original code also had this issue if Engine wasn't cloned.
    // Wait, the original code didn't clone the engine! It just created a NEW Board,
    // which created a NEW Engine, and then it overwrote _gameState.
    // This meant the NEW engine was NOT in sync with the cloned _gameState.
    // This looks like a bug in the original code or Engine is supposed to be stateless (it's not).

    // For now, I'll keep the behavior consistent with original:
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
    const engineState = engine.state();
    const isActingPlayerOne = engineState.playerOne.id === state.player.id;
    const updatedPlayer = isActingPlayerOne
      ? engineState.playerOne
      : engineState.playerTwo;
    const updatedOpponent = isActingPlayerOne
      ? engineState.playerTwo
      : engineState.playerOne;

    const isGameOver = engineState.gameOver;
    const winnerId = engineState.winnerId;

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
    };
  }
}
