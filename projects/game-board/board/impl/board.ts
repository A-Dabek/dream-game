import { Engine, LogEntry } from '../../engine';
import { ItemId } from '../../item';
import {
  BoardInterface,
  BoardLoadout,
  GameActionResult,
  GameActionType,
  GameState,
  StatusEffectData,
} from '../board.model';

export class Board implements BoardInterface {
  private readonly engine: Engine;
  private readonly playerId: string;
  private readonly opponentId: string;

  constructor(player: BoardLoadout, opponent: BoardLoadout) {
    this.playerId = player.id;
    this.opponentId = opponent.id;

    this.engine = new Engine({ ...player }, { ...opponent });
    this.engine.processGameStart();
    this.engine.processTurnStart(this.engine.state.turnQueue[0].playerId);
  }

  get gameState(): GameState {
    const engineState = this.engine.state;
    const isActingPlayerOne = engineState.playerOne.id === this.playerId;
    const updatedPlayer = isActingPlayerOne
      ? engineState.playerOne
      : engineState.playerTwo;
    const updatedOpponent = isActingPlayerOne
      ? engineState.playerTwo
      : engineState.playerOne;

    const playerStatusEffects: StatusEffectData[] = [];
    const opponentStatusEffects: StatusEffectData[] = [];

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
      player: {
        ...updatedPlayer,
      },
      opponent: {
        ...updatedOpponent,
      },
      turnInfo: {
        currentPlayerId: engineState.turnQueue[0].playerId,
        nextPlayerId: engineState.turnQueue[1].playerId,
        turnQueue: engineState.turnQueue,
      },
      isGameOver: engineState.gameOver,
      winnerId: engineState.winnerId,
      actionHistory: engineState.actionHistory,
      playerStatusEffects,
      opponentStatusEffects,
    };
  }

  get isGameOver(): boolean {
    return this.engine.state.gameOver;
  }

  get playerHealth(): number {
    return this.engine.state.playerOne.id === this.playerId
      ? this.engine.state.playerOne.health
      : this.engine.state.playerTwo.health;
  }

  get opponentHealth(): number {
    return this.engine.state.playerOne.id === this.opponentId
      ? this.engine.state.playerOne.health
      : this.engine.state.playerTwo.health;
  }

  get currentPlayerId(): string {
    return this.engine.state.turnQueue[0].playerId;
  }

  get nextPlayerId(): string {
    return this.engine.state.turnQueue[1].playerId;
  }

  playItem(itemId: ItemId, playerId: string): GameActionResult {
    this.validateAction(playerId, GameActionType.PLAY_ITEM, itemId);

    this.engine.play(playerId, itemId);
    this.engine.processEndOfTurn(playerId);

    // Trigger turn start for the next player if game is not over
    if (!this.engine.state.gameOver) {
      this.engine.processTurnStart(this.engine.state.turnQueue[0].playerId);
    }

    const action =
      this.engine.state.actionHistory[
        this.engine.state.actionHistory.length - 1
      ];

    return {
      success: true,
      action,
      newGameState: this.gameState,
    };
  }

  pass(playerId: string): GameActionResult {
    this.validateAction(playerId, GameActionType.PLAY_ITEM);

    this.engine.pass(playerId);

    // Trigger turn start for the next player if game is not over
    if (!this.engine.state.gameOver) {
      this.engine.processTurnStart(this.engine.state.turnQueue[0].playerId);
    }

    const action =
      this.engine.state.actionHistory[
        this.engine.state.actionHistory.length - 1
      ];

    return { success: true, action, newGameState: this.gameState };
  }

  consumeLog(): LogEntry[] {
    return this.engine.consumeLog();
  }

  surrender(playerId: string): GameActionResult {
    this.validateAction(playerId, GameActionType.SURRENDER);

    this.engine.surrender(playerId);

    const action =
      this.engine.state.actionHistory[
        this.engine.state.actionHistory.length - 1
      ];

    return { success: true, action, newGameState: this.gameState };
  }

  clone(): Board {
    const clonedBoard = Object.create(Board.prototype);

    // Deep copy of IDs
    Object.defineProperties(clonedBoard, {
      playerId: { value: this.playerId, writable: false },
      opponentId: { value: this.opponentId, writable: false },
    });

    // Use engine.clone() which already handles deep state cloning
    const clonedEngine = this.engine.clone();

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
    const engineState = this.engine.state;
    if (engineState.gameOver) {
      throw new Error('Game is already over');
    }

    const player =
      engineState.playerOne.id === playerId
        ? engineState.playerOne
        : engineState.playerTwo.id === playerId
          ? engineState.playerTwo
          : null;

    if (!player) {
      throw new Error('Player not found');
    }

    if (engineState.turnQueue[0].playerId !== playerId) {
      throw new Error('Not your turn');
    }

    if (type === GameActionType.PLAY_ITEM && itemId) {
      const hasItem = player.items.some((item) => item.id === itemId);
      if (!hasItem) {
        throw new Error(`Item '${itemId}' not found in player's inventory`);
      }
    }
  }
}
