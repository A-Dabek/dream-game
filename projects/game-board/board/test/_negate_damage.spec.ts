import { describe, expect, it } from 'vitest';
import { Board } from '../impl/board';
import { createMockPlayer } from './test-utils';

describe('Negate Damage Integration Tests', () => {
  it('should negate one instance of damage', () => {
    const p1 = createMockPlayer('p1', {
      speed: 10,
      items: ['_blueprint_attack', '_blueprint_attack'],
    });
    const p2 = createMockPlayer('p2', {
      speed: 11,
      items: ['_blueprint_negate_damage'],
    });
    const board = new Board(p2, p1);

    // p2 plays negate damage
    board.playItem('_blueprint_negate_damage', 'p2');

    // p1 attacks p2 (negated)
    board.playItem('_blueprint_attack', 'p1');
    expect(board.gameState.player.health).toBe(100);

    // p2 passes
    board.pass('p2');

    // p1 attacks p2 (not negated anymore)
    board.playItem('_blueprint_attack', 'p1');
    expect(board.gameState.player.health).toBe(90);
  });

  it('should negate end-of-turn damage from opponent if negate was played BEFORE opponent played status attack', () => {
    const p1 = createMockPlayer('p1', {
      speed: 100,
      items: ['_blueprint_negate_damage'],
    });
    const p2 = createMockPlayer('p2', {
      speed: 1,
      items: ['_blueprint_passive_attack'],
    });
    const board = new Board(p1, p2);

    // p1 plays negate
    board.playItem('_blueprint_negate_damage', 'p1');

    // pass until it's p2's turn
    while ((board.currentPlayerId as string) !== 'p2') {
      board.pass(board.currentPlayerId);
    }

    // p2 plays status attack
    board.playItem('_blueprint_passive_attack', 'p2');

    // p2 end-of-turn damage to p1 was negated.
    expect(board.gameState.player.health).toBe(100);

    // pass until p2's next turn to see damage applied (negate is gone)
    board.pass(board.currentPlayerId);
    while ((board.currentPlayerId as string) !== 'p2') {
      board.pass(board.currentPlayerId);
    }
    board.pass('p2');

    expect(board.gameState.player.health).toBe(95);
  });

  it('should NOT negate end-of-turn damage if negate was played AFTER status attack, but charge should remain', () => {
    const p1 = createMockPlayer('p1', {
      speed: 100,
      items: ['_blueprint_negate_damage', '_blueprint_attack'],
    });
    const p2 = createMockPlayer('p2', {
      speed: 1,
      items: ['_blueprint_passive_attack'],
    });
    const board = new Board(p1, p2);

    // 1. p2 plays status attack (older listener)
    while ((board.currentPlayerId as string) !== 'p2') {
      board.pass(board.currentPlayerId);
    }
    board.playItem('_blueprint_passive_attack', 'p2');
    expect(board.gameState.player.health).toBe(95);

    // 2. p1 plays negate (newer listener)
    while ((board.currentPlayerId as string) !== 'p1') {
      board.pass(board.currentPlayerId);
    }
    board.playItem('_blueprint_negate_damage', 'p1');

    // 3. p2 passes.
    while ((board.currentPlayerId as string) !== 'p2') {
      board.pass(board.currentPlayerId);
    }
    board.pass('p2');

    // status attack (older) triggers and its damage is NOT seen by negate (newer).
    expect(board.gameState.player.health).toBe(90);
  });

  it('should verify negate is still active after being skipped by older status attack', () => {
    const p1 = createMockPlayer('p1', {
      speed: 100,
      items: ['_blueprint_negate_damage'],
    });
    const p2 = createMockPlayer('p2', {
      speed: 1,
      items: ['_blueprint_passive_attack', '_blueprint_attack'],
    });
    const board = new Board(p1, p2);

    // 1. Setup p2's status attack (Older)
    while ((board.currentPlayerId as string) !== 'p2')
      board.pass(board.currentPlayerId);
    board.playItem('_blueprint_passive_attack', 'p2');
    expect(board.gameState.player.health).toBe(95);

    // 2. Setup p1's negate (Newer)
    while ((board.currentPlayerId as string) !== 'p1')
      board.pass(board.currentPlayerId);
    board.playItem('_blueprint_negate_damage', 'p1');

    // 3. End p2's turn again. Passive attack (Older) triggers.
    while ((board.currentPlayerId as string) !== 'p2')
      board.pass(board.currentPlayerId);
    board.pass('p2');
    // Damage should be applied because negate is newer.
    expect(board.gameState.player.health).toBe(90);

    // 4. Verify negate is STILL active by using an active attack from p2.
    while ((board.currentPlayerId as string) !== 'p2')
      board.pass(board.currentPlayerId);
    board.playItem('_blueprint_attack', 'p2');
    // The active attack is negated (90 -> 90),
    // but p2's end-of-turn status attack still triggers (90 -> 85).
    // If negate didn't work, it would be 80.
    expect(board.gameState.player.health).toBe(85);
  });
});
