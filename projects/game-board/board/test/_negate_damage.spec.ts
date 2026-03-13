import { describe, expect, it } from 'vitest';
import { Board } from '../impl/board';
import { createMockPlayer, passUntilTurn } from './test-utils';

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
    passUntilTurn(board, 'p2');

    // p2 plays status attack
    board.playItem('_blueprint_passive_attack', 'p2');

    // p2 end-of-turn damage to p1 was negated.
    expect(board.gameState.player.health).toBe(100);

    // pass until p2's next turn to see damage applied (negate is gone)
    board.pass(board.currentPlayerId);
    passUntilTurn(board, 'p2');
    board.pass('p2');

    expect(board.gameState.player.health).toBe(95);
  });

  it('should negate end-of-turn damage if negate was played AFTER status attack, and charge should be consumed', () => {
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
    passUntilTurn(board, 'p2');
    board.playItem('_blueprint_passive_attack', 'p2');
    expect(board.gameState.player.health).toBe(95);

    // 2. p1 plays negate (newer listener)
    passUntilTurn(board, 'p1');
    board.playItem('_blueprint_negate_damage', 'p1');

    // 3. p2 passes.
    passUntilTurn(board, 'p2');
    board.pass('p2');

    // status attack damage IS seen by negate because of engine loop-until-done logic.
    expect(board.gameState.player.health).toBe(95);
  });

  it('should verify negate is consumed by older status attack', () => {
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
    passUntilTurn(board, 'p2');
    board.playItem('_blueprint_passive_attack', 'p2');
    expect(board.gameState.player.health).toBe(95);

    // 2. Setup p1's negate (Newer)
    passUntilTurn(board, 'p1');
    board.playItem('_blueprint_negate_damage', 'p1');

    // 3. End p2's turn again. Passive attack (Older) triggers.
    passUntilTurn(board, 'p2');
    board.pass('p2');
    // Damage should be negated because negate sees it now.
    expect(board.gameState.player.health).toBe(95);

    // 4. Verify negate is CONSUMED by using an active attack from p2.
    passUntilTurn(board, 'p2');
    board.playItem('_blueprint_attack', 'p2');
    // The active attack is NOT negated anymore (95 -> 85),
    // because negate was consumed by the passive attack.
    // Passive attack also triggers (85 -> 80).
    expect(board.gameState.player.health).toBe(80);
  });
});
