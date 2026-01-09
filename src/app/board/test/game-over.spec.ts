import { describe, expect, it } from 'vitest';
import { Board } from '../board';
import { createMockPlayer } from './test-utils';

describe('GameOver Behavior', () => {
  it('should end game when a player surrenders', () => {
    const player1 = createMockPlayer('p1');
    const player2 = createMockPlayer('p2');
    const board = new Board(player1, player2);

    const result = board.surrender('p2');

    expect(result.success).toBe(true);
    expect(board.isGameOver).toBe(true);
    expect(board.gameState.winnerId).toBe('p1');
  });

  it('should end game when a player plays attack card and kills the opponent immediately', () => {
    // We assume the faster player starts the turn
    const player1 = createMockPlayer('p1', { health: 100, speed: 100 });
    const player2 = createMockPlayer('p2', { health: 5, speed: 1 }); // Low health, sword does 10 damage
    const board = new Board(player1, player2);

    const result = board.playItem('_blueprint_attack', 'p1');

    expect(result.success).toBe(true);
    expect(board.isGameOver).toBe(true);
    expect(board.gameState.winnerId).toBe('p1');
    expect(board.opponentHealth).toBeLessThanOrEqual(0);
  });
});
