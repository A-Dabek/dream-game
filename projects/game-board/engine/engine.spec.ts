import { describe, expect, it } from 'vitest';
import { Loadout } from '../item';
import { Engine } from './engine';
import { EngineState } from './engine.model';

import { createTestItem } from '../board/test/test-utils';

describe('Engine', () => {
  const baseNumberOfListeners = 4;
  const player1: Loadout & { id: string } = {
    id: 'p1',
    health: 100,
    speed: 10,
    items: [createTestItem('_blueprint_attack'), createTestItem('_dummy')],
  };

  const player2: Loadout & { id: string } = {
    id: 'p2',
    health: 100,
    speed: 5,
    items: [createTestItem('_dummy')],
  };

  it('should initialize with two players', () => {
    const engine = new Engine(player1, player2);
    const state = engine.state;

    expect(state.playerOne.id).toBe('p1');
    expect(state.playerTwo.id).toBe('p2');
    expect(state.playerOne.health).toBe(100);
    expect(state.playerTwo.health).toBe(100);
  });

  it('should apply blueprint attack effects (damage) to opponent', () => {
    const engine = new Engine(player1, player2);

    engine.play('p1', '_blueprint_attack');

    const state = engine.state;
    expect(state.playerTwo.health).toBe(90); // Deals 10 damage
    expect(state.playerOne.health).toBe(100);
  });

  it('should handle multiple effects', () => {
    // We only have _blueprint_attack for now, which has one effect.
    // If we had an item with multiple effects, we'd test it here.
    const engine = new Engine(player1, player2);
    engine.play('p1', '_blueprint_attack');
    engine.play('p2', '_blueprint_attack' as any); // p2 doesn't have it in loadout but Engine allows playing by ID for now if we don't check loadout in Engine

    const state = engine.state;
    expect(state.playerOne.health).toBe(90);
    expect(state.playerTwo.health).toBe(90);
  });

  it('should remove item from player loadout after it is played', () => {
    const engine = new Engine(player1, player2);

    expect(engine.state.playerOne.items.length).toBe(2);

    engine.play('p1', '_blueprint_attack');

    expect(engine.state.playerOne.items.length).toBe(1);
  });

  it('should emit remove_listener when parent item is removed', () => {
    const p1: Loadout & { id: string } = {
      id: 'p1',
      health: 100,
      speed: 10,
      items: [createTestItem('_blueprint_attack'), createTestItem('_dummy')],
    };
    const p2: Loadout & { id: string } = {
      id: 'p2',
      health: 100,
      speed: 5,
      items: [
        createTestItem('_blueprint_reactive_removal'),
        createTestItem('_dummy'),
      ],
    };
    const engine = new Engine(p1, p2);

    expect(engine.state.listeners).toHaveLength(baseNumberOfListeners + 1);

    // p1 attacks p2, triggering reactive removal which removes the item and thus the listener
    engine.play('p1', '_blueprint_attack');
    const log = engine.consumeLog();

    expect(engine.state.listeners).toHaveLength(baseNumberOfListeners);
    const hasRemoveListener = log.some(
      (entry) =>
        entry.type === 'state-change' &&
        entry.snapshot.listeners.length === baseNumberOfListeners,
    );
    expect(hasRemoveListener).toBe(true);
  });

  it('should emit remove_listener when duration (charges) expires', () => {
    const p1: Loadout & { id: string } = {
      id: 'p1',
      health: 100,
      speed: 10,
      items: [
        createTestItem('_blueprint_negate_damage'),
        createTestItem('_dummy'),
      ],
    };
    const p2: Loadout & { id: string } = {
      id: 'p2',
      health: 100,
      speed: 5,
      items: [createTestItem('_blueprint_attack'), createTestItem('_dummy')],
    };
    const engine = new Engine(p1, p2);

    engine.play('p1', '_blueprint_negate_damage');
    expect(engine.state.listeners).toHaveLength(baseNumberOfListeners + 1);

    // p2 attacks p1, negate_damage triggers, charge expires, remove_listener emitted
    engine.play('p2', '_blueprint_attack');
    const log = engine.consumeLog();

    expect(engine.state.listeners).toHaveLength(baseNumberOfListeners);
    const hasRemoveListener = log.some(
      (entry) =>
        entry.type === 'state-change' &&
        entry.snapshot.listeners.length === baseNumberOfListeners,
    );
    expect(hasRemoveListener).toBe(true);
  });

  it('should damage player on turn end if they have no items (impatience) and increase damage', () => {
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
    expect(engine.state.playerOne.health).toBe(99); // 1st trigger: 1 damage

    engine.processEndOfTurn('p1');
    expect(engine.state.playerOne.health).toBe(97); // 2nd trigger: 2 damage (99 - 2)

    engine.processEndOfTurn('p1');
    expect(engine.state.playerOne.health).toBe(94); // 3rd trigger: 3 damage (97 - 3)
  });

  it('should mark game over and log event when health drops to zero or below', () => {
    const p1: Loadout & { id: string } = {
      id: 'p1',
      health: 100,
      speed: 10,
      items: [createTestItem('_blueprint_attack')], // deals 10
    };
    const p2: Loadout & { id: string } = {
      id: 'p2',
      health: 5,
      speed: 5,
      items: [createTestItem('_dummy')],
    };
    const engine = new Engine(p1, p2);

    engine.play('p1', '_blueprint_attack');

    const state = engine.state;
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
    expect(engine.state.playerOne.health).toBe(prevHealthP1);
  });

  describe('State Snapshot Integrity (Integration)', () => {
    it('should log distinct state snapshots for each state change (catches missing clone bug)', () => {
      // This test verifies that state snapshots in the log are properly cloned.
      // Bug scenario: When states are logged by reference instead of by value,
      // all log entries point to the same final state object, making it impossible
      // to reconstruct the sequence of state changes for UI replay.

      const p1: Loadout & { id: string } = {
        id: 'p1',
        health: 100,
        speed: 10,
        items: [
          createTestItem('_blueprint_attack'), // deals 10 damage
          createTestItem('_blueprint_attack'), // deals 10 damage
        ],
      };
      const p2: Loadout & { id: string } = {
        id: 'p2',
        health: 100,
        speed: 5,
        items: [
          createTestItem('_blueprint_attack'), // deals 10 damage
        ],
      };
      const engine = new Engine(p1, p2);

      // Execute multiple actions that change state
      engine.play('p1', '_blueprint_attack'); // p2 health: 100 -> 90
      engine.play('p2', '_blueprint_attack'); // p1 health: 100 -> 90
      engine.play('p1', '_blueprint_attack'); // p2 health: 90 -> 80

      const log = engine.consumeLog();
      const stateChanges = log.filter(
        (entry): entry is { type: 'state-change'; snapshot: EngineState } =>
          entry.type === 'state-change',
      );

      // Extract health values from each logged state snapshot
      const p2HealthSequence = stateChanges.map(
        (entry) => entry.snapshot.playerTwo.health,
      );

      // Verify we have multiple state changes logged
      expect(stateChanges.length).toBeGreaterThanOrEqual(2);

      // CRITICAL: Verify that state snapshots are distinct objects with distinct values.
      // If the bug exists (states logged by reference), all entries will show the same final health values.
      // With proper cloning, each snapshot should capture the health at that point in time.

      // Verify p2's health progression: should have gone from 100 -> 90 -> 80
      const uniqueP2Healths = [...new Set(p2HealthSequence)];
      const errorMessage1 = `Expected multiple distinct p2 health values in log, but got: [${p2HealthSequence.join(', ')}]. This indicates state snapshots are being logged by reference instead of by value. All snapshots point to the same final state object.`;
      expect(uniqueP2Healths.length, errorMessage1).toBeGreaterThan(1);

      // Verify that state objects themselves are distinct references
      const stateReferences = stateChanges.map((entry) => entry.snapshot);
      const uniqueReferences = new Set(stateReferences);
      const errorMessage2 = `Expected ${stateChanges.length} distinct state object references in log, but got ${uniqueReferences.size}. This indicates state snapshots are being logged by reference - all entries point to the same state object.`;
      expect(uniqueReferences.size, errorMessage2).toBe(stateChanges.length);

      // Verify the actual health progression makes sense (monotonic changes)
      // p2 should have been damaged twice (100 -> 90 -> 80)
      const finalP2Health =
        stateChanges[stateChanges.length - 1]!.snapshot.playerTwo.health;
      expect(finalP2Health).toBeLessThanOrEqual(80);
    });

    it('should preserve intermediate states for UI replay (catches shared reference bug)', () => {
      // This test simulates what the UI does: replaying the game by applying
      // state changes sequentially. If states are not cloned, all log entries
      // will have the same final state, breaking the replay.

      const p1: Loadout & { id: string } = {
        id: 'p1',
        health: 100,
        speed: 10,
        items: [
          createTestItem('_blueprint_attack'),
          createTestItem('_blueprint_attack'),
          createTestItem('_blueprint_attack'),
        ],
      };
      const p2: Loadout & { id: string } = {
        id: 'p2',
        health: 100,
        speed: 5,
        items: [],
      };
      const engine = new Engine(p1, p2);

      // Play multiple items in sequence
      engine.play('p1', '_blueprint_attack'); // p2: 100 -> 90
      engine.play('p1', '_blueprint_attack'); // p2: 90 -> 80
      engine.play('p1', '_blueprint_attack'); // p2: 80 -> 70

      const log = engine.consumeLog();
      const stateSnapshots = log
        .filter((entry) => entry.type === 'state-change')
        .map(
          (entry) =>
            (entry as { type: 'state-change'; snapshot: EngineState }).snapshot,
        );

      // If properly cloned, each snapshot should show the health at that moment
      // If bug exists, all snapshots will show the final health (70)
      const healthValues = stateSnapshots.map((s) => s.playerTwo.health);

      // Count how many unique health values we see
      const uniqueHealthValues = [...new Set(healthValues)];

      const errorMessage3 = `UI Replay Test Failed: Expected multiple distinct health values to show progression for UI replay, but got [${healthValues.join(', ')}]. This means all state snapshots reference the same final state object. The fix is to clone the state before logging: logStateChange(EngineStateManager.cloneState(nextState))`;
      expect(uniqueHealthValues.length, errorMessage3).toBeGreaterThanOrEqual(
        2,
      );

      // Verify we can actually see the progression
      const hasIntermediateValues = healthValues.some((h) => h > 70);
      const errorMessage4 = `UI Replay Test Failed: All logged states show final health (70). No intermediate states were captured. State snapshots must be cloned before logging to preserve each point-in-time state.`;
      expect(hasIntermediateValues, errorMessage4).toBe(true);
    });
  });
});
