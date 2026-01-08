import { describe, expect, it } from 'vitest';
import { Board } from '../board';
import { createMockPlayer } from './test-utils';

describe('_blueprint_attack Integration Test', () => {
  it('should reduce opponent health when _blueprint_attack is played', () => {
    // We assume the faster player starts the turn
    const player1 = createMockPlayer('p1', { speed: 10 });
    const player2 = createMockPlayer('p2', { speed: 1 });
    const board = new Board(player1, player2);

    const initialOpponentHealth = board.opponentHealth;

    // Player 1 plays _blueprint_attack
    const result = board.playItem('_blueprint_attack', 'p1');

    expect(result.success).toBe(true);
    // Blueprint attack should do 10 damage as defined in BlueprintAttackBehaviour
    expect(board.opponentHealth).toBe(initialOpponentHealth - 10);
  });

  it('should remove _blueprint_attack from player loadout after it is played', () => {
    const player1 = createMockPlayer('p1', {
      speed: 10,
      items: [{ id: '_blueprint_attack' }],
    });
    const player2 = createMockPlayer('p2', { speed: 1 });
    const board = new Board(player1, player2);

    expect(board.gameState.player.items.length).toBe(1);

    board.playItem('_blueprint_attack', 'p1');

    expect(board.gameState.player.items.length).toBe(0);
  });
});
