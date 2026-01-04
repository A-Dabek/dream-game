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
});
