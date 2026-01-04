import {describe, expect, it} from 'vitest';
import {Board} from '../board';
import {BoardLoadout} from '../board.model';

describe('GameOver Behavior', () => {
  const createMockPlayer = (id: string, health: number = 100, speed: number = 1): BoardLoadout => ({
    id,
    health,
    speed,
    items: [{id: 'sword'}],
    damageMultiplier: 1,
  });

  it('should end game when a player surrenders', () => {
    const player1 = createMockPlayer('p1');
    const player2 = createMockPlayer('p2');
    const board = new Board(player1, player2);

    const result = board.surrender('p1');

    expect(result.success).toBe(true);
    expect(board.isGameOver).toBe(true);
    expect(board.gameState.winnerId).toBe('p2');
  });

  it('should end game when a player plays attack card and kills the opponent immediately', () => {
    const player1 = createMockPlayer('p1', 100, 100);
    const player2 = createMockPlayer('p2', 5, 1); // Low health, sword does 10 damage
    const board = new Board(player1, player2);

    expect(board.currentPlayerId).toBe('p1');

    const result = board.playItem('sword', 'p1');

    expect(result.success).toBe(true);
    expect(board.isGameOver).toBe(true);
    expect(board.gameState.winnerId).toBe('p1');
    expect(board.opponentHealth).toBeLessThanOrEqual(0);
  });
});
