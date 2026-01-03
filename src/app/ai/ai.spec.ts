import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Board} from '../board';
import {BoardLoadout, GameActionType} from '../board/board.model';
import {FirstAvailableStrategy, Strategy} from './ai';

describe('FirstAvailableStrategy', () => {
  let strategy: Strategy;

  const createMockPlayer = (id: string, name: string, speed: number, items: any[]): BoardLoadout => ({
    id,
    name,
    health: 100,
    speed,
    items,
    damageMultiplier: 1,
  });

  beforeEach(() => {
    strategy = new FirstAvailableStrategy();
  });

  it('should choose the leftmost item for the current player', () => {
    const player1 = createMockPlayer('player1', 'Player 1', 100, [{ id: 'sword' }, { id: 'shield' }]);
    const player2 = createMockPlayer('player2', 'Player 2', 1, [{ id: 'potion' }]);
    const board = new Board(player1, player2);

    const action = strategy.decide(board);

    expect(action.type).toBe(GameActionType.PLAY_ITEM);
    expect(action.playerId).toBe('player1');
    expect(action.itemId).toBe('sword');
  });

  it('should choose the leftmost item for player 2 when it is their turn', () => {
    const player1 = createMockPlayer('player1', 'Player 1', 1, [{ id: 'sword' }]);
    const player2 = createMockPlayer('player2', 'Player 2', 100, [{ id: 'shield' }, { id: 'potion' }]);
    const board = new Board(player1, player2);

    const action = strategy.decide(board);

    expect(action.type).toBe(GameActionType.PLAY_ITEM);
    expect(action.playerId).toBe('player2');
    expect(action.itemId).toBe('shield');
  });

  it('should return a pass action if the player has no items', () => {
    const player1 = createMockPlayer('player1', 'Player 1', 100, []);
    const player2 = createMockPlayer('player2', 'Player 2', 1, [{ id: 'potion' }]);
    const board = new Board(player1, player2);

    const action = strategy.decide(board);

    expect(action.type).toBe(GameActionType.PLAY_ITEM);
    expect(action.playerId).toBe('player1');
    expect(action.itemId).toBeUndefined();
  });

  it('should use board.clone() to avoid modifying the original board', () => {
    const player1 = createMockPlayer('player1', 'Player 1', 100, [{ id: 'sword' }]);
    const player2 = createMockPlayer('player2', 'Player 2', 1, [{ id: 'potion' }]);
    const board = new Board(player1, player2);

    const cloneSpy = vi.spyOn(board, 'clone');

    strategy.decide(board);

    expect(cloneSpy).toHaveBeenCalled();
  });
});
