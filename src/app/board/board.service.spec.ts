import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BoardService } from './board.service';
import { EngineService } from '../engine';
import { GameState, GameActionType, Player, TurnInfo } from './board.model';

describe('BoardService', () => {
  let service: BoardService;

  const createMockPlayer = (id: string, name: string): Player => ({
    id,
    name,
    health: 100,
    speed: 1,
    items: [
      { name: 'sword' },
      { name: 'shield' },
      { name: 'potion' }
    ]
  });

  const createMockGameState = (): GameState => ({
    player: createMockPlayer('player1', 'Player 1'),
    opponent: createMockPlayer('player2', 'Player 2'),
    turnInfo: {
      currentPlayerId: 'player1',
      nextPlayerId: 'player2',
      turnQueue: ['player1', 'player2']
    },
    isGameOver: false
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BoardService, EngineService]
    });
    service = TestBed.inject(BoardService);
  });

  describe('initialization', () => {
    it('should initialize the game state', () => {
      const gameState = createMockGameState();
      service.initializeGame(gameState);

      expect(service.gameState()).toEqual(gameState);
    });

    it('should have null game state before initialization', () => {
      expect(service.gameState()).toBeNull();
    });

    it('should start with empty action history', () => {
      expect(service.actionHistory()).toEqual([]);
    });
  });

  describe('game state queries', () => {
    beforeEach(() => {
      service.initializeGame(createMockGameState());
    });

    it('should return player health', () => {
      expect(service.playerHealth()).toBe(100);
    });

    it('should return opponent health', () => {
      expect(service.opponentHealth()).toBe(100);
    });

    it('should return player items', () => {
      expect(service.playerItems().length).toBe(3);
      expect(service.playerItems().map((item) => item.name)).toEqual([
        'sword',
        'shield',
        'potion'
      ]);
    });

    it('should return opponent items', () => {
      expect(service.opponentItems().length).toBe(3);
    });

    it('should return current turn info', () => {
      expect(service.currentTurn()).toEqual({
        currentPlayerId: 'player1',
        nextPlayerId: 'player2',
        turnQueue: ['player1', 'player2']
      });
    });

    it('should return is game over status', () => {
      expect(service.isGameOver()).toBe(false);
    });

    it('should return current player ID', () => {
      expect(service.currentPlayerId()).toBe('player1');
    });

    it('should return next player ID', () => {
      expect(service.nextPlayerId()).toBe('player2');
    });
  });

  describe('playItem action', () => {
    beforeEach(() => {
      service.initializeGame(createMockGameState());
    });

    it('should successfully play an item that player owns', () => {
      const result = service.playItem('sword', 'player1');

      expect(result.success).toBe(true);
      expect(result.action.type).toBe(GameActionType.PLAY_ITEM);
      expect(result.action.playerId).toBe('player1');
      expect(result.action.itemName).toBe('sword');
    });

    it('should add action to history on successful play', () => {
      service.playItem('sword', 'player1');

      expect(service.actionHistory().length).toBe(1);
      expect(service.actionHistory()[0].type).toBe(GameActionType.PLAY_ITEM);
    });

    it('should fail if item does not exist in player inventory', () => {
      const result = service.playItem('nonexistent', 'player1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found in player\'s inventory');
      expect(service.actionHistory().length).toBe(0);
    });

    it('should fail if not player\'s turn', () => {
      const result = service.playItem('sword', 'player2');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not your turn');
      expect(service.actionHistory().length).toBe(0);
    });

    it('should fail if game is not initialized', () => {
      service.resetGame();
      const result = service.playItem('sword', 'player1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Game has not been initialized');
    });

    it('should fail if game is over', () => {
      const gameState = createMockGameState();
      gameState.isGameOver = true;
      service.updateGameState(gameState);

      const result = service.playItem('sword', 'player1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Game is already over');
    });

    it('should fail if player not found', () => {
      const result = service.playItem('sword', 'invalid-player');

      expect(result.success).toBe(false);
      // Invalid player won't match current player, so it fails with "Not your turn" first
      expect(result.error).toBe('Not your turn');
    });

    it('should include timestamp in action', () => {
      const beforeTime = Date.now();
      const result = service.playItem('sword', 'player1');
      const afterTime = Date.now();

      expect(result.action.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(result.action.timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('surrender action', () => {
    beforeEach(() => {
      service.initializeGame(createMockGameState());
    });

    it('should successfully surrender', () => {
      const result = service.surrender('player1');

      expect(result.success).toBe(true);
      expect(result.action.type).toBe(GameActionType.SURRENDER);
      expect(result.action.playerId).toBe('player1');
    });

    it('should add action to history on successful surrender', () => {
      service.surrender('player1');

      expect(service.actionHistory().length).toBe(1);
      expect(service.actionHistory()[0].type).toBe(GameActionType.SURRENDER);
    });

    it('should fail if game is not initialized', () => {
      service.resetGame();
      const result = service.surrender('player1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Game has not been initialized');
    });

    it('should fail if game is over', () => {
      const gameState = createMockGameState();
      gameState.isGameOver = true;
      service.updateGameState(gameState);

      const result = service.surrender('player1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Game is already over');
    });

    it('should fail if player not found', () => {
      const result = service.surrender('invalid-player');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Player not found');
    });
  });

  describe('helper methods', () => {
    beforeEach(() => {
      service.initializeGame(createMockGameState());
    });

    it('should get opponent ID correctly', () => {
      expect(service.getOpponentId('player1')).toBe('player2');
      expect(service.getOpponentId('player2')).toBe('player1');
    });

    it('should return null for opponent ID if player not found', () => {
      expect(service.getOpponentId('invalid')).toBeNull();
    });

    it('should check if it\'s a player\'s turn', () => {
      expect(service.isPlayersTurn('player1')).toBe(true);
      expect(service.isPlayersTurn('player2')).toBe(false);
    });

    it('should check if player has an item', () => {
      expect(service.playerHasItem('player1', 'sword')).toBe(true);
      expect(service.playerHasItem('player1', 'nonexistent')).toBe(false);
    });

    it('should get player health', () => {
      expect(service.getPlayerHealth('player1')).toBe(100);
      expect(service.getPlayerHealth('player2')).toBe(100);
      expect(service.getPlayerHealth('invalid')).toBeNull();
    });
  });

  describe('game state updates', () => {
    it('should update game state', () => {
      const initialState = createMockGameState();
      service.initializeGame(initialState);

      const updatedState = createMockGameState();
      updatedState.player.health = 50;
      updatedState.turnInfo.currentPlayerId = 'player2';
      service.updateGameState(updatedState);

      expect(service.gameState()).toEqual(updatedState);
      expect(service.playerHealth()).toBe(50);
      expect(service.currentPlayerId()).toBe('player2');
    });
  });

  describe('reset', () => {
    it('should reset game state and action history', () => {
      service.initializeGame(createMockGameState());
      service.playItem('sword', 'player1');

      service.resetGame();

      expect(service.gameState()).toBeNull();
      expect(service.actionHistory()).toEqual([]);
    });
  });

  describe('multiple actions', () => {
    beforeEach(() => {
      service.initializeGame(createMockGameState());
    });

    it('should track multiple actions in history', () => {
      service.playItem('sword', 'player1');
      // After first playItem, turn advances to player2
      service.playItem('shield', 'player2');
      // After second playItem, turn advances back to player1
      service.surrender('player1');

      expect(service.actionHistory().length).toBe(3);
      expect(service.actionHistory()[0].itemName).toBe('sword');
      expect(service.actionHistory()[1].itemName).toBe('shield');
      expect(service.actionHistory()[2].type).toBe(GameActionType.SURRENDER);
    });

    it('should not add failed actions to history', () => {
      service.playItem('sword', 'player1');
      // After first playItem, turn advances to player2
      service.playItem('nonexistent', 'player2'); // fails - item not found

      expect(service.actionHistory().length).toBe(1);
    });
  });
});

