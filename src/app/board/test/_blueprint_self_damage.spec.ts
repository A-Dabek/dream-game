import {describe, expect, it} from 'vitest';
import {Board} from '../board';
import {createMockPlayer} from './test-utils';

describe('_blueprint_self_damage Integration Test', () => {
  it('should damage the player that plays it', () => {
    const player1 = createMockPlayer('p1', { speed: 10, items: [{ id: '_blueprint_self_damage' }] });
    const player2 = createMockPlayer('p2', { speed: 1 });
    const board = new Board(player1, player2);

    expect(board.gameState.player.health).toBe(100);

    board.playItem('_blueprint_self_damage', 'p1');

    expect(board.gameState.player.health).toBe(90);
    expect(board.gameState.opponent.health).toBe(100);
  });
});
