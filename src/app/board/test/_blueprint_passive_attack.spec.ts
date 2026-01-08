import {describe, expect, it} from 'vitest';
import {Board} from '../board';
import {createMockPlayer} from './test-utils';

describe('_blueprint_passive_attack Integration Test', () => {
  it('should add status effect and deal damage at the end of the turn when played', () => {
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

    board.playItem('_blueprint_passive_attack', 'p2');
    expect(board.playerHealth).toBe(95);

    board.pass('p1');

    // p1 has no end-of-turn effects, so p2 health shouldn't change
    expect(board.opponentHealth).toBe(100);

    board.pass('p2');
    expect(board.playerHealth).toBe(90);
  });
});
