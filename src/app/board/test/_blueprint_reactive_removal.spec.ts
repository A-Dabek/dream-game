import {describe, expect, it} from 'vitest';
import {Board} from '../board';
import {createMockPlayer} from './test-utils';

describe('_blueprint_reactive_removal Integration Test', () => {
  it('should remove _blueprint_reactive_removal from loadout when player is attacked', () => {
    // Player 1 has attack, Player 2 has reactive removal
    const player1 = createMockPlayer('p1', { speed: 10, items: [{ id: '_blueprint_attack' }] });
    const player2 = createMockPlayer('p2', { speed: 5, items: [{ id: '_blueprint_reactive_removal' }] });
    const board = new Board(player1, player2);

    // Initial check: Player 2 should have the reactive item
    expect(board.gameState.opponent.items).toContainEqual({ id: '_blueprint_reactive_removal' });

    // Player 1 attacks Player 2
    board.playItem('_blueprint_attack', 'p1');

    // Player 2 health should be reduced and the reactive item should be removed
    expect(board.gameState.opponent.health).toBe(90);
    expect(board.gameState.opponent.items).not.toContainEqual({ id: '_blueprint_reactive_removal' });
  });

  it('should not remove other items when player is attacked', () => {
    const player1 = createMockPlayer('p1', { speed: 10, items: [{ id: '_blueprint_attack' }] });
    const player2 = createMockPlayer('p2', {
      speed: 5,
      items: [{ id: '_blueprint_reactive_removal' }, { id: '_blueprint_attack' }]
    });
    const board = new Board(player1, player2);

    board.playItem('_blueprint_attack', 'p1');

    expect(board.gameState.opponent.items).not.toContainEqual({ id: '_blueprint_reactive_removal' });
    expect(board.gameState.opponent.items).toContainEqual({ id: '_blueprint_attack' });
  });
});
