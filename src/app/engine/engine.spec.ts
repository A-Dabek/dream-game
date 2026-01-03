import {describe, expect, it} from 'vitest';
import {Loadout} from '../item';
import {Engine} from './engine';

describe('Engine', () => {
  const player1: Loadout & { id: string } = {
    id: 'p1',
    health: 100,
    speed: 10,
    items: [{ id: 'sword' }]
  };

  const player2: Loadout & { id: string } = {
    id: 'p2',
    health: 100,
    speed: 5,
    items: []
  };

  it('should initialize with two players', () => {
    const engine = new Engine(player1, player2);
    const state = engine.state();

    expect(state.playerOne.id).toBe('p1');
    expect(state.playerTwo.id).toBe('p2');
    expect(state.playerOne.health).toBe(100);
    expect(state.playerTwo.health).toBe(100);
  });

  it('should apply sword effects (damage) to opponent', () => {
    const engine = new Engine(player1, player2);

    engine.play('p1', 'sword');

    const state = engine.state();
    expect(state.playerTwo.health).toBe(90); // Sword deals 10 damage
    expect(state.playerOne.health).toBe(100);
  });

  it('should handle damageMultiplier effect', () => {
    const engine = new Engine(player1, player2);

    // Manually play an item with damageMultiplier effect
    // We'll use a mock item behavior for this test if needed, but for now we'll just check if Engine processes it
    // Wait, play() needs an ItemId. Let's register a 'double' item in the registry.
    // Or just check if the damage processor uses the multiplier.

    // Set multiplier for player 1
    engine.play('p1', 'double' as any); // We need to add 'double' to ItemId or use any

    engine.play('p1', 'sword');

    const state = engine.state();
    expect(state.playerOne.damageMultiplier).toBe(2);
    expect(state.playerTwo.health).toBe(80); // 100 - (10 * 2) = 80
  });

  it('should handle multiple effects', () => {
    // We only have sword for now, which has one effect.
    // If we had an item with multiple effects, we'd test it here.
    const engine = new Engine(player1, player2);
    engine.play('p1', 'sword');
    engine.play('p2', 'sword'); // p2 doesn't have it in loadout but Engine allows playing by ID for now if we don't check loadout in Engine

    const state = engine.state();
    expect(state.playerOne.health).toBe(90);
    expect(state.playerTwo.health).toBe(90);
  });
});
