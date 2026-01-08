import { describe, expect, it } from 'vitest';
import { Board } from '../board';
import { createMockPlayer } from './test-utils';

describe('Damage to Heal Integration Tests', () => {
  it('should convert damage to heal for 2 charges', () => {
    const p1 = createMockPlayer('p1', {
      speed: 10,
      items: [
        { id: '_blueprint_attack' },
        { id: '_blueprint_attack' },
        { id: '_blueprint_attack' },
      ],
    });
    const p2 = createMockPlayer('p2', {
      speed: 11,
      items: [{ id: '_blueprint_damage_to_heal_charges' }],
    });
    const board = new Board(p2, p1);

    board.playItem('_blueprint_damage_to_heal_charges', 'p2');

    board.playItem('_blueprint_attack', 'p1');
    expect(board.gameState.player.health).toBe(110);

    board.pass('p2');

    // p1's turn again
    board.playItem('_blueprint_attack', 'p1');
    expect(board.gameState.player.health).toBe(120);

    // p2's turn
    board.pass('p2');

    // p1 attacks p2 (charges exhausted)
    board.playItem('_blueprint_attack', 'p1');
    expect(board.gameState.player.health).toBe(110);
  });

  it('should convert damage to heal for 2 turns', () => {
    const p1 = createMockPlayer('p1', {
      speed: 10,
      items: [
        { id: '_blueprint_attack' },
        { id: '_blueprint_attack' },
        { id: '_blueprint_attack' },
      ],
    });
    const p2 = createMockPlayer('p2', {
      speed: 11,
      items: [{ id: '_blueprint_damage_to_heal_turns' }],
    });
    const board = new Board(p2, p1);

    // p2 plays the item (Turn 1 for p2 ends)
    board.playItem('_blueprint_damage_to_heal_turns', 'p2');

    // p1 attacks p2 (still within 2 turns)
    board.playItem('_blueprint_attack', 'p1');
    expect(board.gameState.player.health).toBe(110);

    // p2 passes (Turn 2 for p2 ends, buff expires)
    board.pass('p2');

    // p1 attacks p2 (buff expired)
    board.playItem('_blueprint_attack', 'p1');
    expect(board.gameState.player.health).toBe(100);
  });

  it('should convert damage to heal permanently', () => {
    const p1 = createMockPlayer('p1', {
      speed: 10,
      items: [
        { id: '_blueprint_attack' },
        { id: '_blueprint_attack' },
        { id: '_blueprint_attack' },
        { id: '_blueprint_attack' },
        { id: '_blueprint_attack' },
      ],
    });
    const p2 = createMockPlayer('p2', {
      speed: 11,
      items: [{ id: '_blueprint_damage_to_heal_permanent' }],
    });
    const board = new Board(p2, p1);

    // p2 plays the item
    board.playItem('_blueprint_damage_to_heal_permanent', 'p2');

    // Many attacks and passes
    for (let i = 0; i < 5; i++) {
      board.playItem('_blueprint_attack', 'p1');
      board.pass('p2');
    }

    expect(board.gameState.player.health).toBe(150);
  });
});
