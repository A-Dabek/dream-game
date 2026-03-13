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

  it('should heal 1 when owner is damaged', () => {
    // Player 1 has the new blueprint item
    const player1 = createMockPlayer('p1', {
      health: 50,
      speed: 1, // Slow player
      items: ['_blueprint_heal_on_damage'],
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
    // Passive should heal 1
    board.playItem('punch', 'p2');

    // Expected: 50 - 5 (punch) + 1 (passive heal) = 46
    console.log(
      'Player 1 health after punch with heal-on-damage:',
      board.playerHealth,
    );

    expect(board.playerHealth).toBe(46);
  });

  it('should handle both items: [damage-to-owner, heal-on-damage]', () => {
    // Player 1 has both blueprint items in this order
    const player1 = createMockPlayer('p1', {
      health: 50,
      speed: 1,
      items: ['_blueprint_damage_to_owner', '_blueprint_heal_on_damage'],
    });

    // Player 2 has a punch item
    const player2 = createMockPlayer('p2', {
      health: 50,
      speed: 10,
      items: ['punch'],
    });

    const board = new Board(player1, player2);
    passUntilTurn(board, 'p2');

    // Player 2 uses punch on Player 1
    board.playItem('punch', 'p2');

    console.log(
      'Player 1 health with [damage-to-owner, heal-on-damage]:',
      board.playerHealth,
    );

    // Order matters: heal-on-damage reacts to both punch and damage-to-owner proc
    expect(board.playerHealth).toBe(46);
  });

  it('should handle both items: [heal-on-damage, damage-to-owner]', () => {
    // Player 1 has both blueprint items in this order
    const player1 = createMockPlayer('p1', {
      health: 50,
      speed: 1,
      items: ['_blueprint_heal_on_damage', '_blueprint_damage_to_owner'],
    });

    // Player 2 has a punch item
    const player2 = createMockPlayer('p2', {
      health: 50,
      speed: 10,
      items: ['punch'],
    });

    const board = new Board(player1, player2);
    passUntilTurn(board, 'p2');

    // Player 2 uses punch on Player 1
    board.playItem('punch', 'p2');

    console.log(
      'Player 1 health with [heal-on-damage, damage-to-owner]:',
      board.playerHealth,
    );

    // Both items now react to each other's effects through the engine's loop-until-done logic
    expect(board.playerHealth).toBe(46);
  });
});
