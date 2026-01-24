import { describe, expect, it } from 'vitest';
import { Board } from '../impl/board';
import { createMockPlayer } from './test-utils';

describe('_blueprint_triple_threat Integration Test', () => {
  it('should deal 1 damage at the end of turn if just passing (passive effect)', () => {
    const player1 = createMockPlayer('p1', {
      speed: 10,
      items: [{ id: '_blueprint_triple_threat' }],
    });
    const player2 = createMockPlayer('p2', { speed: 1 });
    const board = new Board(player1, player2);

    const initialHealth = board.opponentHealth;
    board.pass('p1');

    // Passive effect: 1 damage at the end of turn
    expect(board.opponentHealth).toBe(initialHealth - 1);
  });

  it('should deal 2 damage immediately and 3 damage at the end of turn when played (active + status)', () => {
    const player1 = createMockPlayer('p1', {
      speed: 10,
      items: [{ id: '_blueprint_triple_threat' }],
    });
    const player2 = createMockPlayer('p2', { speed: 1 });
    const board = new Board(player1, player2);

    const initialHealth = board.opponentHealth;
    board.playItem('_blueprint_triple_threat', 'p1');

    // Active: 2 damage immediately
    // Status (onTurnEnd): 3 damage at the end of the same turn
    // Passive (1 damage) should NOT trigger because the item is removed from loadout when played
    expect(board.opponentHealth).toBe(initialHealth - 5);
  });

  it('should continue dealing 3 damage at the end of subsequent turns (status effect)', () => {
    const player1 = createMockPlayer('p1', {
      speed: 2,
      items: [{ id: '_blueprint_triple_threat' }],
    });
    const player2 = createMockPlayer('p2', { speed: 1 });
    const board = new Board(player1, player2);

    board.playItem('_blueprint_triple_threat', 'p1');
    const healthAfterPlay = board.opponentHealth;

    // Current player should be p2 now
    expect(board.currentPlayerId).toBe('p2');
    board.pass('p2');

    // Current player should be p1 now
    expect(board.currentPlayerId).toBe('p1');
    board.pass('p1');

    // Should deal another 3 damage from the status effect
    expect(board.opponentHealth).toBe(healthAfterPlay - 3);
  });
});
