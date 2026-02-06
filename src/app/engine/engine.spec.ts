import { describe, expect, it } from 'vitest';
import { Loadout } from '../item';
import { Engine } from './engine';

describe('Engine', () => {
  const player1: Loadout & { id: string } = {
    id: 'p1',
    health: 100,
    speed: 10,
    items: [{ id: '_blueprint_attack' }, { id: '_dummy' }],
  };

  const player2: Loadout & { id: string } = {
    id: 'p2',
    health: 100,
    speed: 5,
    items: [{ id: '_dummy' }],
  };

  it('should initialize with two players', () => {
    const engine = new Engine(player1, player2);
    const state = engine.state();

    expect(state.playerOne.id).toBe('p1');
    expect(state.playerTwo.id).toBe('p2');
    expect(state.playerOne.health).toBe(100);
    expect(state.playerTwo.health).toBe(100);
  });

  it('should apply blueprint attack effects (damage) to opponent', () => {
    const engine = new Engine(player1, player2);

    engine.play('p1', '_blueprint_attack');

    const state = engine.state();
    expect(state.playerTwo.health).toBe(90); // Deals 10 damage
    expect(state.playerOne.health).toBe(100);
  });

  it('should handle multiple effects', () => {
    // We only have _blueprint_attack for now, which has one effect.
    // If we had an item with multiple effects, we'd test it here.
    const engine = new Engine(player1, player2);
    engine.play('p1', '_blueprint_attack');
    engine.play('p2', '_blueprint_attack' as any); // p2 doesn't have it in loadout but Engine allows playing by ID for now if we don't check loadout in Engine

    const state = engine.state();
    expect(state.playerOne.health).toBe(90);
    expect(state.playerTwo.health).toBe(90);
  });

  it('should remove item from player loadout after it is played', () => {
    const engine = new Engine(player1, player2);

    expect(engine.state().playerOne.items.length).toBe(2);

    engine.play('p1', '_blueprint_attack');

    expect(engine.state().playerOne.items.length).toBe(1);
  });

  it('should emit remove_listener when parent item is removed', () => {
    const p1: Loadout & { id: string } = {
      id: 'p1',
      health: 100,
      speed: 10,
      items: [{ id: '_blueprint_attack' }, { id: '_dummy' }],
    };
    const p2: Loadout & { id: string } = {
      id: 'p2',
      health: 100,
      speed: 5,
      items: [{ id: '_blueprint_reactive_removal' }, { id: '_dummy' }],
    };
    const engine = new Engine(p1, p2);

    expect(engine.state().listeners).toHaveLength(3);

    // p1 attacks p2, triggering reactive removal which removes the item and thus the listener
    engine.play('p1', '_blueprint_attack');
    const log = engine.consumeLog();

    expect(engine.state().listeners).toHaveLength(2);
    const hasRemoveListener = log.some(
      (entry) =>
        entry.type === 'state-change' && entry.snapshot.listeners.length === 2,
    );
    expect(hasRemoveListener).toBe(true);
  });

  it('should emit remove_listener when duration (charges) expires', () => {
    const p1: Loadout & { id: string } = {
      id: 'p1',
      health: 100,
      speed: 10,
      items: [{ id: '_blueprint_negate_damage' }, { id: '_dummy' }],
    };
    const p2: Loadout & { id: string } = {
      id: 'p2',
      health: 100,
      speed: 5,
      items: [{ id: '_blueprint_attack' }, { id: '_dummy' }],
    };
    const engine = new Engine(p1, p2);

    engine.play('p1', '_blueprint_negate_damage');
    expect(engine.state().listeners).toHaveLength(3);

    // p2 attacks p1, negate_damage triggers, charge expires, remove_listener emitted
    engine.play('p2', '_blueprint_attack');
    const log = engine.consumeLog();

    expect(engine.state().listeners).toHaveLength(2);
    const hasRemoveListener = log.some(
      (entry) =>
        entry.type === 'state-change' && entry.snapshot.listeners.length === 2,
    );
    expect(hasRemoveListener).toBe(true);
  });

  it('should damage player on turn end if they have no items', () => {
    const p1: Loadout & { id: string } = {
      id: 'p1',
      health: 100,
      speed: 10,
      items: [],
    };
    const p2: Loadout & { id: string } = {
      id: 'p2',
      health: 100,
      speed: 5,
      items: [],
    };
    const engine = new Engine(p1, p2);

    engine.processEndOfTurn('p1');

    expect(engine.state().playerOne.health).toBe(99);
  });

  it('should mark game over and log event when health drops to zero or below', () => {
    const p1: Loadout & { id: string } = {
      id: 'p1',
      health: 100,
      speed: 10,
      items: [{ id: '_blueprint_attack' }], // deals 10
    };
    const p2: Loadout & { id: string } = {
      id: 'p2',
      health: 5,
      speed: 5,
      items: [{ id: '_dummy' }],
    };
    const engine = new Engine(p1, p2);

    engine.play('p1', '_blueprint_attack');

    const state = engine.state();
    expect(state.playerTwo.health).toBeLessThanOrEqual(0);
    expect(state.gameOver).toBe(true);
    expect(state.winnerId).toBe('p1');

    const log = engine.consumeLog();
    const hasGameOverEvent = log.some(
      (e) =>
        e.type === 'event' &&
        (e.event as any).type === 'lifecycle' &&
        (e.event as any).phase === 'game_over',
    );
    expect(hasGameOverEvent).toBe(true);

    // Further events should be ignored
    const prevHealthP1 = state.playerOne.health;
    engine.processEndOfTurn('p1');
    expect(engine.state().playerOne.health).toBe(prevHealthP1);
  });
});
