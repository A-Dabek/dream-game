import { describe, expect, it } from 'vitest';
import { createTestItem } from '../board/test/test-utils';
import { Loadout } from '../item';
import { Engine } from './engine';
import { StateChangeLogEntry } from './engine.model';

describe('Engine Log', () => {
  const player1: Loadout & { id: string } = {
    id: 'p1',
    health: 100,
    speed: 10,
    items: [createTestItem('_blueprint_attack')],
  };

  const player2: Loadout & { id: string } = {
    id: 'p2',
    health: 100,
    speed: 5,
    items: [createTestItem('_blueprint_negate_damage')],
  };

  it('should og on_play and effects', () => {
    const engine = new Engine(player1, player2);
    engine.play('p1', '_blueprint_attack');
    const log = engine.consumeLog();

    // 1. on_play event
    expect(log[0]).toMatchObject({
      type: 'event',
      event: { type: 'on_play', playerId: 'p1', itemId: '_blueprint_attack' },
    });

    // 2. remove_item event (every item play triggers remove_item effect)
    expect(log[1]).toMatchObject({
      type: 'event',
      event: {
        type: 'effect',
        effect: {
          type: 'remove_item',
          value: expect.any(String),
          target: 'self',
        },
        playerId: 'p1',
      },
    });

    // 3. state change after remove_item is processed
    expect(log[2]).toMatchObject({
      type: 'state-change',
    });
    // After remove_item, playerOne should have no items
    expect(
      (log[2] as StateChangeLogEntry).snapshot.playerOne.items.length,
    ).toBe(0);

    // 4. damage event
    expect(log[3]).toMatchObject({
      type: 'event',
      event: {
        type: 'effect',
        effect: { type: 'damage', value: 10, target: 'enemy' },
        playerId: 'p1',
      },
    });

    // 5. state change after damage is processed
    expect(log[4]).toMatchObject({
      type: 'state-change',
    });
    expect((log[4] as StateChangeLogEntry).snapshot.playerTwo.health).toBe(90);
  });

  it('should log turn end', () => {
    const engine = new Engine(player1, player2);
    engine.processEndOfTurn('p1');
    const log = engine.consumeLog();

    expect(log[0]).toMatchObject({
      type: 'event',
      event: { type: 'lifecycle', playerId: 'p1', phase: 'on_turn_end' },
    });
  });
});
