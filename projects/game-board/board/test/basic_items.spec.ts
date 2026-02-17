import { describe, expect, it } from 'vitest';
import { BASE_HEAL, GAME_CONFIG, ItemId } from '../../item';
import { Board } from '../impl/board';
import { createMockPlayer, MockPlayerOverrides } from './test-utils';

/**
 * Creates a board with two players for testing.
 * Player 1 has the specified items and higher speed to ensure they start.
 * Player 2 has default configuration unless overridden.
 */
function createTestBoard(
  player1Items: ItemId[],
  player1Overrides: Omit<MockPlayerOverrides, 'items' | 'speed'> = {},
  player2Overrides: MockPlayerOverrides = {},
): Board {
  const player1 = createMockPlayer('p1', {
    speed: 10,
    items: player1Items,
    ...player1Overrides,
  });
  const player2 = createMockPlayer('p2', { speed: 1, ...player2Overrides });
  return new Board(player1, player2);
}

describe('punch Integration Test', () => {
  it('should reduce opponent health by BASE_ATTACK when punch is played', () => {
    const board = createTestBoard(['punch']);
    const initialOpponentHealth = board.opponentHealth;

    const result = board.playItem('punch', 'p1');

    expect(result.success).toBe(true);
    expect(board.opponentHealth).toBe(
      initialOpponentHealth - GAME_CONFIG.BASE_ATTACK,
    );
  });

  it('should remove punch from player loadout after it is played', () => {
    const board = createTestBoard(['punch']);

    expect(board.gameState.player.items.length).toBe(2);

    board.playItem('punch', 'p1');

    expect(board.gameState.player.items.length).toBe(1);
  });

  it('should deal exactly 5 damage (BASE_ATTACK value)', () => {
    const board = createTestBoard(['punch'], {}, { health: 100 });

    board.playItem('punch', 'p1');

    expect(board.opponentHealth).toBe(95);
  });
});

describe('sticking_plaster Integration Test', () => {
  it('should increase player health by BASE_HEAL when sticking_plaster is played', () => {
    const board = createTestBoard(['sticking_plaster'], { health: 50 });
    const initialPlayerHealth = board.gameState.player.health;

    const result = board.playItem('sticking_plaster', 'p1');

    expect(result.success).toBe(true);
    expect(board.gameState.player.health).toBe(initialPlayerHealth + BASE_HEAL);
  });

  it('should remove sticking_plaster from player loadout after it is played', () => {
    const board = createTestBoard(['sticking_plaster']);

    expect(board.gameState.player.items.length).toBe(2);

    board.playItem('sticking_plaster', 'p1');

    expect(board.gameState.player.items.length).toBe(1);
  });

  it('should heal exactly 6 health (calculated BASE_HEAL value)', () => {
    const board = createTestBoard(['sticking_plaster'], { health: 50 });

    board.playItem('sticking_plaster', 'p1');

    expect(board.gameState.player.health).toBe(56);
  });
});

describe('hand Integration Test', () => {
  it('should have no effect on health when played', () => {
    const board = createTestBoard(['hand'], {}, { health: 100 });
    const initialPlayerHealth = board.gameState.player.health;
    const initialOpponentHealth = board.opponentHealth;

    const result = board.playItem('hand', 'p1');

    expect(result.success).toBe(true);
    expect(board.gameState.player.health).toBe(initialPlayerHealth);
    expect(board.opponentHealth).toBe(initialOpponentHealth);
  });

  it('should remove hand from player loadout after it is played', () => {
    const board = createTestBoard(['hand']);

    expect(board.gameState.player.items.length).toBe(2);

    board.playItem('hand', 'p1');

    expect(board.gameState.player.items.length).toBe(1);
  });

  it('should advance the turn after playing', () => {
    const board = createTestBoard(['hand'], {}, { speed: 5, items: ['hand'] });

    expect(board.currentPlayerId).toBe('p1');

    board.playItem('hand', 'p1');

    expect(board.currentPlayerId).toBe('p2');
  });
});
