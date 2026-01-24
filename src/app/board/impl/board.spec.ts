import { beforeEach, describe, expect, it } from 'vitest';
import { Board } from './board';
import { GameActionType } from '../board.model';
import { createMockPlayer } from '../test/test-utils';

describe('Board', () => {
  describe('initialization', () => {
    it('should initialize with turn order based on speed (13 vs 16)', () => {
      const p1 = createMockPlayer('player1', { speed: 13 });
      const p2 = createMockPlayer('player2', { speed: 16 });

      const board = new Board(p1, p2);

      // p1=13, p2=16, total=29. err=14.5
      // index 0: err = 14.5 - 13 = 1.5. else -> p2
      expect(board.currentPlayerId).toBe('player2');
      // index 1: err = 1.5 - 13 = -11.5. if -> p1
      expect(board.nextPlayerId).toBe('player1');
    });

    it('should distribute turns according to speed (1 vs 1)', () => {
      const p1 = createMockPlayer('player1', { speed: 1 });
      const p2 = createMockPlayer('player2', { speed: 1 });

      const board = new Board(p1, p2);

      // index 0: err = 1 - 1 = 0. else -> p2
      expect(board.currentPlayerId).toBe('player2');
      // index 1: err = 0 - 1 = -1. if -> p1
      expect(board.nextPlayerId).toBe('player1');
    });
  });

  describe('playItem action', () => {
    let board: Board;

    beforeEach(() => {
      board = new Board(
        createMockPlayer('player1', { speed: 2 }),
        createMockPlayer('player2', { speed: 1 }),
      );
    });

    it('should successfully play an item that player owns', () => {
      const boardInstance = new Board(
        createMockPlayer('player1', { speed: 100 }),
        createMockPlayer('player2', { speed: 1 }),
      );
      const result = boardInstance.playItem('_blueprint_attack', 'player1');

      expect(result.success).toBe(true);
      expect(result.action.type).toBe(GameActionType.PLAY_ITEM);
      expect(result.action.playerId).toBe('player1');
      expect(result.action.itemId).toBe('_blueprint_attack');
    });

    it('should add action to history on successful play', () => {
      const boardInstance = new Board(
        createMockPlayer('player1', { speed: 100 }),
        createMockPlayer('player2', { speed: 1 }),
      );
      boardInstance.playItem('_blueprint_attack', 'player1');

      expect(boardInstance.gameState.actionHistory.length).toBe(1);
      expect(boardInstance.gameState.actionHistory[0].type).toBe(
        GameActionType.PLAY_ITEM,
      );
    });

    it('should update gameState on successful play', () => {
      // With speed 1 vs 1, index 0 is player2.
      // So player 1 cannot play on index 0.
      // Let's use speed where player 1 starts.
      const boardInstance = new Board(
        createMockPlayer('player1', { speed: 100 }),
        createMockPlayer('player2', { speed: 1 }),
      );

      const initialHealth = boardInstance.opponentHealth;
      boardInstance.playItem('_blueprint_attack', 'player1');

      expect(boardInstance.opponentHealth).toBeLessThan(initialHealth);
    });

    it('should fail if item does not exist in player inventory', () => {
      expect(() => board.playItem('nonexistent' as any, 'player1')).toThrow(
        "Item 'nonexistent' not found in player's inventory",
      );
      expect(board.gameState.actionHistory.length).toBe(0);
    });

    it("should fail if not player's turn", () => {
      expect(() => board.playItem('_blueprint_attack', 'player2')).toThrow(
        'Not your turn',
      );
      expect(board.gameState.actionHistory.length).toBe(0);
    });

    it('should fail if game is over', () => {
      board.surrender('player1');
      expect(() => board.playItem('_blueprint_attack', 'player1')).toThrow(
        'Game is already over',
      );
    });
  });

  describe('pass action', () => {
    let board: Board;

    beforeEach(() => {
      board = new Board(
        createMockPlayer('player1', { speed: 2 }),
        createMockPlayer('player2', { speed: 1 }),
      );
    });

    it('should successfully pass turn', () => {
      const result = board.pass('player1');
      expect(result.success).toBe(true);
      expect(board.currentPlayerId).toBe('player2');
    });

    it("should throw error if passing when it is not player's turn", () => {
      expect(() => board.pass('player2')).toThrow('Not your turn');
    });
  });

  describe('surrender action', () => {
    let board: Board;

    beforeEach(() => {
      board = new Board(
        createMockPlayer('player1', { speed: 2 }),
        createMockPlayer('player2', { speed: 1 }),
      );
    });

    it('should successfully surrender', () => {
      const result = board.surrender('player1');

      expect(result.success).toBe(true);
      expect(board.isGameOver).toBe(true);
      expect(board.gameState.winnerId).toBe('player2');
    });

    it('should throw error if surrendering when game is already over', () => {
      board.surrender('player1');
      expect(() => board.surrender('player1')).toThrow('Game is already over');
    });

    it('should throw error if surrendering player is not found', () => {
      expect(() => board.surrender('nonexistent')).toThrow('Player not found');
    });

    it('should add action to history on successful surrender', () => {
      board.surrender('player1');

      expect(board.gameState.actionHistory.length).toBe(1);
      expect(board.gameState.actionHistory[0].type).toBe(
        GameActionType.SURRENDER,
      );
    });
  });

  describe('simulation (cloning)', () => {
    let board: Board;

    beforeEach(() => {
      board = new Board(
        createMockPlayer('player1'),
        createMockPlayer('player2'),
      );
    });

    it('should allow exploring future scenarios using clones without affecting original', () => {
      const boardInstance = new Board(
        createMockPlayer('player1', { speed: 100 }),
        createMockPlayer('player2', { speed: 1 }),
      );

      const boardSnapshot = boardInstance.clone();
      const initialOpponentHealth = boardInstance.opponentHealth;

      const result = boardSnapshot.playItem('_blueprint_attack', 'player1');

      expect(result.success).toBe(true);
      expect(boardSnapshot.opponentHealth).toBeLessThan(initialOpponentHealth);

      // Original board should NOT be affected
      expect(boardInstance.opponentHealth).toBe(initialOpponentHealth);
      expect(boardInstance.gameState.actionHistory.length).toBe(0);
    });

    it('should allow multiple moves on a clone', () => {
      const boardInstance = new Board(
        createMockPlayer('player1', {
          speed: 100,
          items: [{ id: '_blueprint_attack' }, { id: '_blueprint_attack' }],
        }),
        createMockPlayer('player2', { speed: 1 }),
      );

      const boardSnapshot = boardInstance.clone();
      // index 0: p1
      boardSnapshot.playItem('_blueprint_attack', 'player1');
      // index 1: p1 still? floor(2*100/101) = 1, floor(1*100/101) = 0. Yes.
      boardSnapshot.playItem('_blueprint_attack', 'player1');

      expect(boardSnapshot.gameState.actionHistory.length).toBe(2);
      expect(boardInstance.gameState.actionHistory.length).toBe(0);
    });
  });
});
