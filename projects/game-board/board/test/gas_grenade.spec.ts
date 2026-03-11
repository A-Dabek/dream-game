import { describe, expect, it } from 'vitest';
import { Board } from '../impl/board';
import { createMockPlayer, passUntilTurn } from './test-utils';

describe('gas_grenade Integration Test', () => {
  it('should apply poison to both players when played', () => {
    const player1 = createMockPlayer('p1', {
      speed: 2,
      items: ['gas_grenade'],
      health: 100,
    });
    const player2 = createMockPlayer('p2', {
      speed: 1,
      health: 100,
    });
    const board = new Board(player1, player2);

    // Player 1 plays gas_grenade
    board.playItem('gas_grenade', 'p1');

    // Poison should trigger at end of p1's turn, dealing 1 damage to p1
    expect(board.playerHealth).toBe(99);
    // p2's turn hasn't ended yet, so p2 still at full health
    expect(board.opponentHealth).toBe(100);
  });

  it('should deal damage to both players at the end of each turn', () => {
    const player1 = createMockPlayer('p1', {
      speed: 2,
      items: ['gas_grenade'],
      health: 100,
    });
    const player2 = createMockPlayer('p2', {
      speed: 1,
      health: 100,
    });
    const board = new Board(player1, player2);

    // Player 1 plays gas_grenade, ends turn, takes 1 poison damage
    board.playItem('gas_grenade', 'p1');
    expect(board.playerHealth).toBe(99);

    // Player 2 passes, ends turn, takes 1 poison damage
    board.pass('p2');
    expect(board.opponentHealth).toBe(99);

    // Wait until it's p1's turn again and pass
    passUntilTurn(board, 'p1');
    board.pass('p1');
    // p1 takes another 1 poison damage
    expect(board.playerHealth).toBe(98);

    // Wait until it's p2's turn again and pass
    passUntilTurn(board, 'p2');
    board.pass('p2');
    // p2 takes another 1 poison damage
    expect(board.opponentHealth).toBe(98);
  });

  it('should expire after 10 turns', () => {
    const player1 = createMockPlayer('p1', {
      speed: 2,
      items: ['gas_grenade'],
      health: 100,
    });
    const player2 = createMockPlayer('p2', {
      speed: 1,
      health: 100,
    });
    const board = new Board(player1, player2);

    // Play gas_grenade - this is p1's turn
    board.playItem('gas_grenade', 'p1');
    // p1 takes 1 damage
    let p1Damage = 1;
    let p2Damage = 0;

    // Continue until each player has had 10 turns
    let iterations = 0;
    const maxIterations = 50;
    while ((p1Damage < 10 || p2Damage < 10) && iterations < maxIterations) {
      const currentPlayer = board.currentPlayerId;
      board.pass(currentPlayer);
      if (currentPlayer === 'p1') {
        p1Damage++;
      } else {
        p2Damage++;
      }
      iterations++;
    }
    if (iterations >= maxIterations) {
      throw new Error(
        `Timeout: exceeded ${maxIterations} iterations in gas_grenade test`,
      );
    }

    // After 10 turns each, both players should have taken 10 damage total
    expect(board.playerHealth).toBe(90);
    expect(board.opponentHealth).toBe(90);

    // Play a few more turns - poison should be expired, no more damage
    const currentHealthP1 = board.playerHealth;
    const currentHealthP2 = board.opponentHealth;

    for (let i = 0; i < 4; i++) {
      board.pass(board.currentPlayerId);
    }

    // Health should remain unchanged
    expect(board.playerHealth).toBe(currentHealthP1);
    expect(board.opponentHealth).toBe(currentHealthP2);
  });

  it('should deal exactly 1 damage per poison stack', () => {
    const player1 = createMockPlayer('p1', {
      speed: 2,
      items: ['gas_grenade', 'gas_grenade'],
      health: 100,
    });
    const player2 = createMockPlayer('p2', {
      speed: 1,
      health: 100,
    });
    const board = new Board(player1, player2);

    // Play first gas_grenade - p1 takes 1 damage at end of turn
    board.playItem('gas_grenade', 'p1');
    expect(board.playerHealth).toBe(99);

    // Wait until it's p1's turn again
    // Note: p2 will take damage during this wait
    const p2HealthBefore = board.opponentHealth;
    passUntilTurn(board, 'p1');
    const p2TurnsTaken = p2HealthBefore - board.opponentHealth;

    // Play second gas_grenade
    board.playItem('gas_grenade', 'p1');
    // p1 takes 1 damage from poison
    expect(board.playerHealth).toBe(98);

    // Verify p2 took damage from first poison during wait
    expect(board.opponentHealth).toBe(p2HealthBefore - p2TurnsTaken);

    // Wait until it's p2's turn and pass
    passUntilTurn(board, 'p2');
    const p2HealthAfter = board.opponentHealth;
    board.pass('p2');
    // p2 takes 1 damage from poison
    expect(board.opponentHealth).toBe(p2HealthAfter - 1);

    // Wait until it's p1's turn again and pass
    passUntilTurn(board, 'p1');
    const p1HealthBefore = board.playerHealth;
    board.pass('p1');
    // p1 takes another 2 damage
    expect(board.playerHealth).toBe(p1HealthBefore - 1);
  });
});
