import { describe, expect, it } from 'vitest';
import { GAME_CONFIG, ItemId } from '../../item';
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

describe('sticky_boot Integration Test', () => {
  it('should reduce enemy speed immediately when sticky_boot is played', () => {
    const board = createTestBoard(['sticky_boot']);
    const initialEnemySpeed = board.gameState.opponent.speed;

    const result = board.playItem('sticky_boot', 'p1');

    expect(result.success).toBe(true);
    expect(board.gameState.opponent.speed).toBe(
      initialEnemySpeed - GAME_CONFIG.BASE_SPEED_MODIFIER,
    );
  });

  it('should remove sticky_boot from player loadout after it is played', () => {
    const board = createTestBoard(['sticky_boot']);

    expect(board.gameState.player.items.length).toBe(2);

    board.playItem('sticky_boot', 'p1');

    expect(board.gameState.player.items.length).toBe(1);
  });

  it('should affect turn order when enemy speed is reduced', () => {
    // Create a scenario where p2 would normally go next due to similar speeds
    const player1 = createMockPlayer('p1', {
      speed: 10,
      items: ['sticky_boot', 'hand'],
    });
    const player2 = createMockPlayer('p2', {
      speed: 8,
      items: ['hand'],
    });
    const board = new Board(player1, player2);

    // Record turn queue before playing sticky_boot
    const queueBefore = [...board.gameState.turnInfo.turnQueue];

    board.playItem('sticky_boot', 'p1');

    // After reducing p2's speed, turn queue should be recalculated
    const queueAfter = board.gameState.turnInfo.turnQueue;
    expect(queueBefore).not.toEqual(queueAfter);
  });

  it('should persist speed reduction across multiple turns', () => {
    const board = createTestBoard(['sticky_boot']);
    const initialEnemySpeed = board.gameState.opponent.speed;

    board.playItem('sticky_boot', 'p1');
    const reducedSpeed = board.gameState.opponent.speed;
    expect(reducedSpeed).toBe(
      initialEnemySpeed - GAME_CONFIG.BASE_SPEED_MODIFIER,
    );

    // Advance several turns by passing (whoever's turn it is)
    for (let i = 0; i < 4; i++) {
      const currentPlayerId = board.gameState.turnInfo.currentPlayerId;
      board.pass(currentPlayerId);
    }

    // Speed should still be reduced
    expect(board.gameState.opponent.speed).toBe(reducedSpeed);
  });
});

describe('wingfoot Integration Test', () => {
  it('should increase player speed immediately when wingfoot is played', () => {
    const board = createTestBoard(['wingfoot']);
    const initialPlayerSpeed = board.gameState.player.speed;

    const result = board.playItem('wingfoot', 'p1');

    expect(result.success).toBe(true);
    expect(board.gameState.player.speed).toBe(
      initialPlayerSpeed + GAME_CONFIG.BASE_SPEED_MODIFIER,
    );
  });

  it('should remove wingfoot from player loadout after it is played', () => {
    const board = createTestBoard(['wingfoot']);

    expect(board.gameState.player.items.length).toBe(2);

    board.playItem('wingfoot', 'p1');

    expect(board.gameState.player.items.length).toBe(1);
  });

  it('should affect turn order when player speed is increased', () => {
    // Create players with similar speeds - p2 starts (speed 10 > 8)
    const player1 = createMockPlayer('p1', {
      speed: 8,
      items: ['wingfoot', 'hand'],
    });
    const player2 = createMockPlayer('p2', {
      speed: 10,
      items: ['hand'],
    });
    const board = new Board(player1, player2);

    // p2 goes first (higher speed), so p1 needs to wait for their turn
    // Pass until it's p1's turn
    while (board.gameState.turnInfo.currentPlayerId !== 'p1') {
      board.pass(board.gameState.turnInfo.currentPlayerId);
    }

    // Record turn queue before playing wingfoot
    const queueBefore = [...board.gameState.turnInfo.turnQueue];

    board.playItem('wingfoot', 'p1');

    // After increasing p1's speed, turn queue should be recalculated
    const queueAfter = board.gameState.turnInfo.turnQueue;
    expect(queueBefore).not.toEqual(queueAfter);
  });

  it('should persist speed increase across multiple turns', () => {
    const board = createTestBoard(['wingfoot']);
    const initialPlayerSpeed = board.gameState.player.speed;

    board.playItem('wingfoot', 'p1');
    const increasedSpeed = board.gameState.player.speed;
    expect(increasedSpeed).toBe(
      initialPlayerSpeed + GAME_CONFIG.BASE_SPEED_MODIFIER,
    );

    // Advance several turns by passing (whoever's turn it is)
    for (let i = 0; i < 4; i++) {
      const currentPlayerId = board.gameState.turnInfo.currentPlayerId;
      board.pass(currentPlayerId);
    }

    // Speed should still be increased
    expect(board.gameState.player.speed).toBe(increasedSpeed);
  });
});

describe('sticky_boot and wingfoot Interaction Test', () => {
  it('should stack speed modifications correctly', () => {
    // Give p1 higher speed to ensure they start
    const player1 = createMockPlayer('p1', {
      speed: 11,
      items: ['wingfoot', 'sticky_boot', 'hand'],
    });
    const player2 = createMockPlayer('p2', {
      speed: 10,
      items: ['hand'],
    });
    const board = new Board(player1, player2);

    const initialP1Speed = board.gameState.player.speed;
    const initialP2Speed = board.gameState.opponent.speed;

    // Play wingfoot to speed up p1
    board.playItem('wingfoot', 'p1');
    expect(board.gameState.player.speed).toBe(
      initialP1Speed + GAME_CONFIG.BASE_SPEED_MODIFIER,
    );

    // Pass until it's p1's turn again
    let turnsPassed = 0;
    while (
      board.gameState.turnInfo.currentPlayerId !== 'p1' &&
      turnsPassed < 10
    ) {
      board.pass(board.gameState.turnInfo.currentPlayerId);
      turnsPassed++;
    }

    // Play sticky_boot to slow down p2
    board.playItem('sticky_boot', 'p1');

    // p1 should have wingfoot bonus, p2 should have sticky_boot penalty
    expect(board.gameState.player.speed).toBe(
      initialP1Speed + GAME_CONFIG.BASE_SPEED_MODIFIER,
    );
    expect(board.gameState.opponent.speed).toBe(
      initialP2Speed - GAME_CONFIG.BASE_SPEED_MODIFIER,
    );
  });

  it('should allow multiple speed modifications to stack on same player', () => {
    // Give p1 higher speed to ensure they start
    const player1 = createMockPlayer('p1', {
      speed: 11,
      items: ['wingfoot', 'wingfoot', 'hand'],
    });
    const player2 = createMockPlayer('p2', {
      speed: 10,
      items: ['hand'],
    });
    const board = new Board(player1, player2);

    const initialSpeed = board.gameState.player.speed;

    // Play first wingfoot
    board.playItem('wingfoot', 'p1');
    expect(board.gameState.player.speed).toBe(
      initialSpeed + GAME_CONFIG.BASE_SPEED_MODIFIER,
    );

    // Pass until it's p1's turn again
    let turnsPassed = 0;
    while (
      board.gameState.turnInfo.currentPlayerId !== 'p1' &&
      turnsPassed < 10
    ) {
      board.pass(board.gameState.turnInfo.currentPlayerId);
      turnsPassed++;
    }

    board.playItem('wingfoot', 'p1');

    // Speed should be increased twice
    expect(board.gameState.player.speed).toBe(
      initialSpeed + GAME_CONFIG.BASE_SPEED_MODIFIER * 2,
    );
  });

  it('should correctly calculate turn order with mixed speed changes', () => {
    // Setup: p1 starts with speed 8, p2 with speed 12 (p2 goes first)
    const player1 = createMockPlayer('p1', {
      speed: 8,
      items: ['wingfoot', 'hand'],
    });
    const player2 = createMockPlayer('p2', {
      speed: 12,
      items: ['sticky_boot', 'hand'],
    });
    const board = new Board(player1, player2);

    // p2 goes first (higher speed), pass until it's p1's turn
    let turnsPassed = 0;
    while (
      board.gameState.turnInfo.currentPlayerId !== 'p1' &&
      turnsPassed < 10
    ) {
      board.pass(board.gameState.turnInfo.currentPlayerId);
      turnsPassed++;
    }

    // p1 plays wingfoot: speed becomes 11 (8 + 3)
    board.playItem('wingfoot', 'p1');
    expect(board.gameState.player.speed).toBe(11);

    // Pass until it's p2's turn
    turnsPassed = 0;
    while (
      board.gameState.turnInfo.currentPlayerId !== 'p2' &&
      turnsPassed < 10
    ) {
      board.pass(board.gameState.turnInfo.currentPlayerId);
      turnsPassed++;
    }

    // p2 plays sticky_boot on p1: p1's speed becomes 8 (11 - 3)
    board.playItem('sticky_boot', 'p2');
    // p1 is board.gameState.player, p2 is board.gameState.opponent
    // sticky_boot targets the enemy, so p1's speed is reduced
    expect(board.gameState.player.speed).toBe(8);
  });
});
