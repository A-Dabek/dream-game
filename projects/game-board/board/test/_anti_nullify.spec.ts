import { describe, expect, it } from 'vitest';
import { Board } from '../impl/board';
import { createMockPlayer, passUntilTurn } from './test-utils';

describe('Anti-Nullify Integration Tests', () => {
  it('should prevent negation when anti-nullify is present (Negate first, Anti-Nullify second)', () => {
    const p1 = createMockPlayer('p1', {
      speed: 10,
      items: ['_blueprint_passive_negate', '_blueprint_anti_nullify'],
    });
    const p2 = createMockPlayer('p2', {
      speed: 11,
      items: ['_blueprint_attack'],
    });
    const board = new Board(p1, p2);

    // Turn 1: p2 (speed 11) goes first.
    passUntilTurn(board, 'p2');
    board.playItem('_blueprint_attack', 'p2');

    // Damage should NOT be negated because anti-nullify restores it
    expect(board.gameState.player.health).toBe(90);
  });

  it('should prevent negation when anti-nullify is present (Anti-Nullify first, Negate second)', () => {
    const p1 = createMockPlayer('p1', {
      speed: 10,
      items: ['_blueprint_anti_nullify', '_blueprint_passive_negate'],
    });
    const p2 = createMockPlayer('p2', {
      speed: 11,
      items: ['_blueprint_attack'],
    });
    const board = new Board(p1, p2);

    // Turn 1: p2 (speed 11) goes first.
    passUntilTurn(board, 'p2');
    board.playItem('_blueprint_attack', 'p2');

    // Damage should NOT be negated because anti-nullify restores it
    expect(board.gameState.player.health).toBe(90);
  });

  it('should still negate if anti-nullify is NOT present', () => {
    const p1 = createMockPlayer('p1', {
      speed: 10,
      items: ['_blueprint_passive_negate'],
    });
    const p2 = createMockPlayer('p2', {
      speed: 11,
      items: ['_blueprint_attack'],
    });
    const board = new Board(p1, p2);

    // Turn 1: p2 (speed 11) goes first.
    passUntilTurn(board, 'p2');
    board.playItem('_blueprint_attack', 'p2');

    // Damage SHOULD be negated
    expect(board.gameState.player.health).toBe(100);
  });
});
