import {describe, expect, it} from 'vitest';
import {Loadout} from '../item';
import {Engine} from './engine';

describe('Engine', () => {
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
    items: [],
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

    expect(engine.state().playerOne.items.length).toBe(1);

    engine.play('p1', '_blueprint_attack');

    expect(engine.state().playerOne.items.length).toBe(0);
  });

  it('should emit remove_listener when parent item is removed', () => {
    const p1: Loadout & { id: string } = {
      id: 'p1',
      health: 100,
      speed: 10,
      items: [{ id: '_blueprint_attack' }],
    };
    const p2: Loadout & { id: string } = {
      id: 'p2',
      health: 100,
      speed: 5,
      items: [{ id: '_blueprint_reactive_removal' }],
    };
    const engine = new Engine(p1, p2);

    expect(engine.state().listeners).toHaveLength(1);

    // p1 attacks p2, triggering reactive removal which removes the item and thus the listener
    const log = engine.play('p1', '_blueprint_attack');

    expect(engine.state().listeners).toHaveLength(0);
    const hasRemoveListener = log.some(
      (entry) => entry.type === 'processor' && entry.effect.type === 'remove_listener'
    );
    expect(hasRemoveListener).toBe(true);
  });

  it('should emit remove_listener when duration (charges) expires', () => {
    const p1: Loadout & { id: string } = {
      id: 'p1',
      health: 100,
      speed: 10,
      items: [{ id: '_blueprint_negate_damage' }],
    };
    const p2: Loadout & { id: string } = {
      id: 'p2',
      health: 100,
      speed: 5,
      items: [{ id: '_blueprint_attack' }],
    };
    const engine = new Engine(p1, p2);

    engine.play('p1', '_blueprint_negate_damage');
    expect(engine.state().listeners).toHaveLength(1);

    // p2 attacks p1, negate_damage triggers, charge expires, remove_listener emitted
    const log = engine.play('p2', '_blueprint_attack');

    expect(engine.state().listeners).toHaveLength(0);
    const hasRemoveListener = log.some(
      (entry) => entry.type === 'processor' && entry.effect.type === 'remove_listener'
    );
    expect(hasRemoveListener).toBe(true);
  });
});
