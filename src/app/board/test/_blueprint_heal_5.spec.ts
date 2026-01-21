import { describe, expect, it } from 'vitest';
import { Board } from '../board';
import { createMockPlayer } from './test-utils';

describe('_blueprint_heal_5 Integration Test', () => {
  it('should heal 5 health to the player who plays it', () => {
    const p1 = createMockPlayer('p1', { speed: 10 });
    const p2 = createMockPlayer('p2', {
      speed: 1,
      items: [{ id: '_blueprint_heal_5' }],
      health: 95,
    });
    const board = new Board(p2, p1);

    const result = board.playItem('_blueprint_heal_5', 'p2');

    expect(result.success).toBe(true);
    expect(board.gameState.player.health).toBe(100);
  });
});
