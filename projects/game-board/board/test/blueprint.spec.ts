import { describe, expect, it } from 'vitest';
import { Board } from '../impl/board';
import { createMockPlayer, passUntilTurn } from './test-utils';

describe('Blueprint Passive Effect Integration Test', () => {
  it('should deal 1 extra damage to owner when they are damaged', () => {
    // Player 1 has the new blueprint item
    const player1 = createMockPlayer('p1', {
      health: 50,
      speed: 1, // Slow player
      items: ['_blueprint_damage_to_owner'],
    });

    // Player 2 has a punch item
    const player2 = createMockPlayer('p2', {
      health: 50,
      speed: 10, // Fast player to start first
      items: ['punch'],
    });

    const board = new Board(player1, player2);

    // Ensure it's p2's turn to attack
    passUntilTurn(board, 'p2');

    // Player 2 uses punch on Player 1
    // Punch deals 5 damage
    // Passive should deal 1 extra damage
    board.playItem('punch', 'p2');

    // Expected: 50 - 5 (punch) - 1 (passive) = 44
    // Actual: we will see
    console.log('Player 1 health after punch:', board.playerHealth);

    expect(board.playerHealth).toBe(44);
  });
});
