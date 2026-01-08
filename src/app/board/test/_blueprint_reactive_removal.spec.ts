import { describe, expect, it } from 'vitest';
import { Board } from '../board';
import { createMockPlayer } from './test-utils';

describe('_blueprint_reactive_removal Integration Test', () => {
  it('should remove _blueprint_reactive_removal from loadout when player is attacked', () => {
    // Player 1 has attack, Player 2 has reactive removal
    const player1 = createMockPlayer('p1', {
      speed: 10,
      items: [{ id: '_blueprint_attack' }],
    });
    const player2 = createMockPlayer('p2', {
      speed: 5,
      items: [{ id: '_blueprint_reactive_removal' }],
    });
    const board = new Board(player1, player2);

    // Initial check: Player 2 should have the reactive item
    expect(
      board.gameState.opponent.items.some(
        (i) => i.id === '_blueprint_reactive_removal',
      ),
    ).toBe(true);

    // Player 1 attacks Player 2
    board.playItem('_blueprint_attack', 'p1');

    // Player 2 health should be reduced and the reactive item should be removed
    expect(board.gameState.opponent.health).toBe(90);
    expect(
      board.gameState.opponent.items.some(
        (i) => i.id === '_blueprint_reactive_removal',
      ),
    ).toBe(false);
  });

  it('should not remove other items when player is attacked', () => {
    const player1 = createMockPlayer('p1', {
      speed: 10,
      items: [{ id: '_blueprint_attack' }],
    });
    const player2 = createMockPlayer('p2', {
      speed: 5,
      items: [
        { id: '_blueprint_reactive_removal' },
        { id: '_blueprint_attack' },
      ],
    });
    const board = new Board(player1, player2);

    board.playItem('_blueprint_attack', 'p1');

    expect(
      board.gameState.opponent.items.some(
        (i) => i.id === '_blueprint_reactive_removal',
      ),
    ).toBe(false);
    expect(
      board.gameState.opponent.items.some((i) => i.id === '_blueprint_attack'),
    ).toBe(true);
  });

  it('should remove _blueprint_reactive_removal when owner damages themselves', () => {
    const player1 = createMockPlayer('p1', {
      speed: 10,
      items: [
        { id: '_blueprint_self_damage' },
        { id: '_blueprint_reactive_removal' },
      ],
    });
    const player2 = createMockPlayer('p2', { speed: 1 });
    const board = new Board(player1, player2);

    expect(
      board.gameState.player.items.some(
        (i) => i.id === '_blueprint_reactive_removal',
      ),
    ).toBe(true);

    board.playItem('_blueprint_self_damage', 'p1');

    expect(board.gameState.player.health).toBe(90);
    expect(
      board.gameState.player.items.some(
        (i) => i.id === '_blueprint_reactive_removal',
      ),
    ).toBe(false);
  });

  it('should only remove the item from the player that got damaged when both players have it', () => {
    const player1 = createMockPlayer('p1', {
      speed: 10,
      items: [
        { id: '_blueprint_attack' },
        { id: '_blueprint_reactive_removal' },
      ],
    });
    const player2 = createMockPlayer('p2', {
      speed: 5,
      items: [{ id: '_blueprint_reactive_removal' }],
    });
    const board = new Board(player1, player2);

    // Both players have the item
    expect(
      board.gameState.player.items.some(
        (i) => i.id === '_blueprint_reactive_removal',
      ),
    ).toBe(true);
    expect(
      board.gameState.opponent.items.some(
        (i) => i.id === '_blueprint_reactive_removal',
      ),
    ).toBe(true);

    // Player 1 attacks Player 2
    board.playItem('_blueprint_attack', 'p1');

    // Player 2 got damaged, item should be removed from P2 but NOT from P1
    expect(board.gameState.opponent.health).toBe(90);
    expect(
      board.gameState.opponent.items.some(
        (i) => i.id === '_blueprint_reactive_removal',
      ),
    ).toBe(false);
    expect(
      board.gameState.player.items.some(
        (i) => i.id === '_blueprint_reactive_removal',
      ),
    ).toBe(true);
  });
});
