import {describe, expect, it} from 'vitest';
import {Board} from '../board';
import {createMockPlayer} from './test-utils';

describe('_blueprint_passive_attack Integration Test', () => {
  it('should add passive effect and deal damage at the end of the turn when played', () => {
    const player1 = createMockPlayer('p1', { speed: 10, items: [{ id: '_blueprint_passive_attack' }] });
    const player2 = createMockPlayer('p2', { speed: 1 });
    const board = new Board(player1, player2);

    const initialOpponentHealth = board.opponentHealth;

    // Player 1 plays _blueprint_passive_attack
    board.playItem('_blueprint_passive_attack', 'p1');

    // Passive attack should do 5 damage at the end of the turn
    expect(board.opponentHealth).toBe(initialOpponentHealth - 5);
  });

  it('should deal damage again at the end of the next turn (after passing)', () => {
    const player1 = createMockPlayer('p1', { speed: 10, items: [{ id: '_blueprint_passive_attack' }] });
    const player2 = createMockPlayer('p2', { speed: 1 });
    const board = new Board(player1, player2);

    board.playItem('_blueprint_passive_attack', 'p1');
    const healthAfterFirstTurn = board.opponentHealth;

    // It's player 1's turn again because they are much faster (speed 10 vs 1)
    expect(board.currentPlayerId).toBe('p1');

    // Player 1 passes
    board.pass('p1');

    // Should deal damage again
    expect(board.opponentHealth).toBe(healthAfterFirstTurn - 5);
  });

  it('should deal damage when player with end-of-turn effects passes', () => {
    const player1 = createMockPlayer('p1', { speed: 1 });
    const player2 = createMockPlayer('p2', {
        speed: 1,
        items: [{ id: '_blueprint_passive_attack' }],
        health: 100
    });
    const board = new Board(player1, player2);

    // Speed 1 vs 1. Index 0 is player2 (default tie-break or Bresenham start)
    // Actually, TurnManager tie-break: if err = combined/2.
    // 1+1=2. err=1.
    // Index 0: err = 1 - 1 = 0. else -> p2.
    expect(board.currentPlayerId).toBe('p2');

    board.playItem('_blueprint_passive_attack', 'p2');
    expect(board.playerHealth).toBe(95);

    // Next turn is p1 (index 1: err = 0 - 1 = -1. if -> p1)
    expect(board.currentPlayerId).toBe('p1');
    board.pass('p1');

    // p1 has no end-of-turn effects, so p2 health shouldn't change
    expect(board.opponentHealth).toBe(100);

    // Next turn is p2
    expect(board.currentPlayerId).toBe('p2');
    board.pass('p2');
    expect(board.playerHealth).toBe(90);
  });
});
