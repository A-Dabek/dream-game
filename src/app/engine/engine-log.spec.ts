import { describe, expect, it } from 'vitest';
import { Loadout } from '../item';
import { Engine } from './engine';

describe('Engine Log', () => {
  const player1: Loadout & { id: string } = {
    id: 'p1',
    health: 100,
    speed: 10,
    items: [{ id: '_blueprint_attack' }],
  };

  const player2: Loadout & { id: string } = {
    id: 'p2',
    health: 100,
    speed: 5,
    items: [{ id: '_blueprint_negate_damage' }],
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
        type: 'remove_item',
        value: expect.any(String),
        target: 'self',
        playerId: 'p1',
      },
    });

    // 3. remove_item processor
    expect(log[2]).toMatchObject({
      type: 'processor',
      effect: {
        type: 'remove_item',
        value: expect.any(String),
        target: 'self',
      },
      targetPlayerId: 'p1',
    });

    // 4. damage event
    expect(log[3]).toMatchObject({
      type: 'event',
      event: { type: 'damage', value: 10, target: 'enemy', playerId: 'p1' },
    });

    // 5. damage processor
    expect(log[4]).toMatchObject({
      type: 'processor',
      effect: { type: 'damage', value: 10, target: 'enemy' },
      targetPlayerId: 'p2',
    });
  });

  it('should log reactions', () => {
    const engine = new Engine(player1, player2);

    // P2 plays negate damage
    engine.play('p2', '_blueprint_negate_damage');

    // P1 attacks
    engine.play('p1', '_blueprint_attack');
    const playLog = engine.consumeLog();

    // We expect:
    // - event: on_play
    // - event: remove_item
    // - processor: remove_item
    // - event: damage
    // - reaction: from negate damage listener
    // (no damage processor because it was negated/cancelled)

    expect(playLog).toContainEqual(
      expect.objectContaining({
        type: 'reaction',
        playerId: 'p2',
      }),
    );

    const damageProcessorLog = playLog.find(
      (l) => l.type === 'processor' && l.effect.type === 'damage',
    );
    expect(damageProcessorLog).toBeUndefined();
  });

  it('should log turn end', () => {
    const engine = new Engine(player1, player2);
    engine.processEndOfTurn('p1');
    const log = engine.consumeLog();

    expect(log[0]).toMatchObject({
      type: 'event',
      event: { type: 'on_turn_end', playerId: 'p1' },
    });
  });
});
