import { describe, expect, it } from 'vitest';
import { StatusEffect } from '../../item';
import { ListenerFactory } from './listener-factory';
import { createInitialListenerData } from './types';
import { EngineState, GameEvent } from '../engine.types';

describe('ListenerFactory', () => {
  const createMockEvent = (
    playerId: string = 'player-1',
    phase?: string,
  ): GameEvent =>
    ({
      type: phase ? 'lifecycle' : 'effect',
      phase: phase,
      effect: phase
        ? undefined
        : { type: 'damage', value: 5, target: 'enemy' as const },
      playerId,
    }) as unknown as GameEvent;

  const createMockState = (): EngineState =>
    ({
      playerOne: { id: 'player-1', items: [], health: 100, speed: 10 },
      playerTwo: { id: 'player-2', items: [], health: 100, speed: 10 },
      turnQueue: [],
      listeners: [],
      gameOver: false,
    }) as unknown as EngineState;

  describe('create', () => {
    it('should create a listener from StatusEffect with charges duration', () => {
      const effect: StatusEffect = {
        type: 'negate',
        condition: { type: 'match_type', value: 'damage' },
        action: [],
        duration: { type: 'charges', value: 1 },
        genre: 'basic',
      mergeStrategy: 'new',
      };

      const listenerData = createInitialListenerData(
        'listener-1',
        'player-1',
        effect,
      );

      const listener = ListenerFactory.deserialize(listenerData);

      expect(listener.instanceId).toBe('listener-1');
      expect(listener.playerId).toBe('player-1');
      expect(listener).toBeDefined();
      expect(typeof listener.handle).toBe('function');
      expect(typeof listener.serialize).toBe('function');
    });

    it('should create a listener from StatusEffect with turns duration', () => {
      const effect: StatusEffect = {
        type: 'invert',
        condition: { type: 'match_type', value: 'damage' },
        action: [],
        duration: { type: 'turns', value: 3 },
        genre: 'basic',
      mergeStrategy: 'new',
      };

      const listenerData = createInitialListenerData(
        'listener-2',
        'player-2',
        effect,
      );

      const listener = ListenerFactory.deserialize(listenerData);

      expect(listener.instanceId).toBe('listener-2');
      expect(listener.playerId).toBe('player-2');
      expect(typeof listener.handle).toBe('function');
    });

    it('should create a listener from StatusEffect with until_item_removed duration', () => {
      const effect: StatusEffect = {
        type: 'reactive_removal',
        condition: { type: 'match_type', value: 'damage' },
        action: [],
        duration: { type: 'until_item_removed', value: 'item-123' },
        genre: 'basic',
      mergeStrategy: 'new',
      };

      const listenerData = createInitialListenerData(
        'listener-3',
        'player-1',
        effect,
      );

      const listener = ListenerFactory.deserialize(listenerData);

      expect(listener.instanceId).toBe('listener-3');
      expect(listener.playerId).toBe('player-1');
    });

    it('should create a listener from StatusEffect with permanent duration', () => {
      const effect: StatusEffect = {
        type: 'periodic_attack',
        condition: { type: 'on_turn_end' },
        action: [{ type: 'attack', value: 3 }],
        duration: { type: 'permanent' },
        genre: 'basic',
      mergeStrategy: 'new',
      };

      const listenerData = createInitialListenerData(
        'listener-4',
        'player-1',
        effect,
      );

      const listener = ListenerFactory.deserialize(listenerData);

      expect(listener.instanceId).toBe('listener-4');
      expect(listener.playerId).toBe('player-1');
    });
  });

  describe('serialize/deserialize round-trip', () => {
    it('should preserve instanceId and playerId through serialize/deserialize', () => {
      const effect: StatusEffect = {
        type: 'negate',
        condition: { type: 'match_type', value: 'damage' },
        action: [],
        duration: { type: 'charges', value: 1 },
        genre: 'basic',
      mergeStrategy: 'new',
      };

      const originalListenerData = createInitialListenerData(
        'listener-1',
        'player-1',
        effect,
      );

      const originalListener =
        ListenerFactory.deserialize(originalListenerData);
      const serialized = originalListener.serialize();
      const deserializedListener = ListenerFactory.deserialize(serialized);

      expect(deserializedListener.instanceId).toBe(originalListener.instanceId);
      expect(deserializedListener.playerId).toBe(originalListener.playerId);
    });

    it('should preserve charges duration through serialize/deserialize', () => {
      const effect: StatusEffect = {
        type: 'negate',
        condition: { type: 'on_turn_end' },
        action: [],
        duration: { type: 'charges', value: 2 },
        genre: 'basic',
      mergeStrategy: 'new',
      };

      const originalListenerData = createInitialListenerData(
        'listener-1',
        'player-1',
        effect,
      );

      const originalListener =
        ListenerFactory.deserialize(originalListenerData);
      const serialized = originalListener.serialize();
      const deserializedListener = ListenerFactory.deserialize(serialized);

      expect(serialized.effectState.currentDuration.type).toBe('charges');
      expect(serialized.effectState.currentDuration.remaining).toBe(2);
      expect(deserializedListener.instanceId).toBe('listener-1');
      expect(deserializedListener.playerId).toBe('player-1');
    });

    it('should preserve turns duration through serialize/deserialize', () => {
      const effect: StatusEffect = {
        type: 'invert',
        condition: { type: 'on_turn_end' },
        action: [],
        duration: { type: 'turns', value: 3 },
        genre: 'basic',
      mergeStrategy: 'new',
      };

      const originalListenerData = createInitialListenerData(
        'listener-2',
        'player-2',
        effect,
      );

      const originalListener =
        ListenerFactory.deserialize(originalListenerData);
      const serialized = originalListener.serialize();
      const deserializedListener = ListenerFactory.deserialize(serialized);

      expect(serialized.effectState.currentDuration.type).toBe('turns');
      expect(serialized.effectState.currentDuration.remaining).toBe(3);
      expect(deserializedListener.instanceId).toBe('listener-2');
      expect(deserializedListener.playerId).toBe('player-2');
    });

    it('should preserve effect data through serialize/deserialize', () => {
      const effect: StatusEffect = {
        type: 'negate',
        condition: { type: 'match_type', value: 'damage' },
        action: [],
        duration: { type: 'charges', value: 1 },
        genre: 'basic',
      mergeStrategy: 'new',
      };

      const originalListenerData = createInitialListenerData(
        'listener-1',
        'player-1',
        effect,
      );

      const originalListener =
        ListenerFactory.deserialize(originalListenerData);
      const serialized = originalListener.serialize();

      expect(serialized.effectState.effect.type).toBe('negate');
      expect(serialized.effectState.effect.condition.type).toBe('match_type');
      expect(serialized.effectState.effect.condition.value).toBe('damage');

      // Also verify the deserialized listener has the same data
      const deserializedListener = ListenerFactory.deserialize(serialized);
      const deserializedSerialized = deserializedListener.serialize();
      expect(deserializedSerialized.effectState.effect.type).toBe('negate');
    });
  });

  describe('handle + serialize + deserialize round-trip', () => {
    it('should reduce charges after handle and preserve state through serialize/deserialize', () => {
      const effect: StatusEffect = {
        type: 'negate',
        condition: { type: 'on_turn_end' },
        action: [],
        duration: { type: 'charges', value: 2 },
        genre: 'basic',
      mergeStrategy: 'new',
      };

      const listenerData = createInitialListenerData(
        'listener-1',
        'player-1',
        effect,
      );

      const listener = ListenerFactory.deserialize(listenerData);
      const mockEvent = createMockEvent('player-1', 'on_turn_end');
      const mockState = createMockState();

      // Handle the event - charges should be reduced
      listener.handle(mockEvent, mockState);
      const serialized = listener.serialize();

      expect(serialized.instanceId).toBe('listener-1');
      expect(serialized.playerId).toBe('player-1');
      expect(serialized.effectState.currentDuration.type).toBe('charges');
      expect(serialized.effectState.currentDuration.remaining).toBe(1);

      // Deserialize and verify state is preserved
      const deserializedListener = ListenerFactory.deserialize(serialized);

      // Handle event again - charges should be reduced again
      deserializedListener.handle(mockEvent, mockState);
      const serializedAgain = deserializedListener.serialize();

      expect(serializedAgain.effectState.currentDuration.remaining).toBe(0);
    });

    it('should reduce turns after handle and preserve state through serialize/deserialize', () => {
      const effect: StatusEffect = {
        type: 'invert',
        condition: { type: 'on_turn_end' },
        action: [],
        duration: { type: 'turns', value: 3 },
        genre: 'basic',
      mergeStrategy: 'new',
      };

      const listenerData = createInitialListenerData(
        'listener-2',
        'player-2',
        effect,
      );

      const listener = ListenerFactory.deserialize(listenerData);
      const mockEvent = createMockEvent('player-2', 'on_turn_end');
      const mockState = createMockState();

      // Handle the event - turns should be reduced
      listener.handle(mockEvent, mockState);
      const serialized = listener.serialize();

      expect(serialized.instanceId).toBe('listener-2');
      expect(serialized.playerId).toBe('player-2');
      expect(serialized.effectState.currentDuration.type).toBe('turns');
      expect(serialized.effectState.currentDuration.remaining).toBe(2);

      // Deserialize and verify state is preserved
      const deserializedListener = ListenerFactory.deserialize(serialized);

      // Handle event again - turns should be reduced again
      deserializedListener.handle(mockEvent, mockState);
      const serializedAgain = deserializedListener.serialize();

      expect(serializedAgain.effectState.currentDuration.remaining).toBe(1);
    });

    it('should work correctly after full cycle: create -> handle -> serialize -> deserialize -> handle -> verify', () => {
      const effect: StatusEffect = {
        type: 'periodic_attack',
        condition: { type: 'on_turn_end' },
        action: [{ type: 'attack', value: 3 }],
        duration: { type: 'charges', value: 3 },
        genre: 'basic',
      mergeStrategy: 'new',
      };

      const listenerData = createInitialListenerData(
        'listener-1',
        'player-1',
        effect,
      );

      // Create listener
      const listener = ListenerFactory.deserialize(listenerData);
      const mockEvent = createMockEvent('player-1', 'on_turn_end');
      const mockState = createMockState();

      // Handle first turn
      listener.handle(mockEvent, mockState);
      let serialized = listener.serialize();
      expect(serialized.effectState.currentDuration.remaining).toBe(2);

      // Serialize and deserialize
      let deserializedListener = ListenerFactory.deserialize(serialized);

      // Handle second turn
      deserializedListener.handle(mockEvent, mockState);
      serialized = deserializedListener.serialize();
      expect(serialized.effectState.currentDuration.remaining).toBe(1);

      // Serialize and deserialize again
      deserializedListener = ListenerFactory.deserialize(serialized);

      // Handle third turn
      deserializedListener.handle(mockEvent, mockState);
      serialized = deserializedListener.serialize();

      // After third charge is used, remaining should be 0
      expect(serialized.effectState.currentDuration.remaining).toBe(0);
    });

    it('should preserve permanent duration through handle and serialize/deserialize', () => {
      const effect: StatusEffect = {
        type: 'periodic_attack',
        condition: { type: 'on_turn_end' },
        action: [{ type: 'attack', value: 3 }],
        duration: { type: 'permanent' },
        genre: 'basic',
      mergeStrategy: 'new',
      };

      const listenerData = createInitialListenerData(
        'listener-1',
        'player-1',
        effect,
      );

      const listener = ListenerFactory.deserialize(listenerData);
      const mockEvent = createMockEvent('player-1', 'on_turn_end');
      const mockState = createMockState();

      // Handle event
      listener.handle(mockEvent, mockState);
      const serialized = listener.serialize();

      expect(serialized.instanceId).toBe('listener-1');
      expect(serialized.playerId).toBe('player-1');
      expect(serialized.effectState.currentDuration.type).toBe('permanent');
      expect(serialized.effectState.currentDuration.remaining).toBe(0);

      // Deserialize and verify
      const deserializedListener = ListenerFactory.deserialize(serialized);
      const serializedAgain = deserializedListener.serialize();

      expect(serializedAgain.effectState.currentDuration.type).toBe(
        'permanent',
      );
    });

    it('should create AdvanceTurnListener and serialize/deserialize correctly', () => {
      const listener = ListenerFactory.createAdvanceTurn('player-1');
      const mockEvent = createMockEvent('player-1', 'on_turn_end');
      const mockState = createMockState();

      listener.handle(mockEvent, mockState);
      const serialized = listener.serialize();

      expect(serialized.instanceId).toBe('advance_turn-player-1');
      expect(serialized.playerId).toBe('player-1');
      expect(serialized.effectState.currentDuration.type).toBe('permanent');
      expect(serialized.effectState.currentDuration.remaining).toBe(0);

      // Deserialize and verify
      const deserializedListener = ListenerFactory.deserialize(serialized);
      expect(deserializedListener.instanceId).toBe('advance_turn-player-1');
      expect(deserializedListener.playerId).toBe('player-1');
    });

    it('should create FatigueListener and serialize/deserialize correctly', () => {
      const listener = ListenerFactory.createFatigue('player-1');
      const mockEvent = createMockEvent('player-1', 'on_turn_end');
      const mockState = createMockState();

      listener.handle(mockEvent, mockState);
      const serialized = listener.serialize();

      expect(serialized.instanceId).toBe('fatigue-player-1');
      expect(serialized.playerId).toBe('player-1');
      expect(serialized.effectState.currentDuration.type).toBe('permanent');
      expect(serialized.effectState.currentDuration.remaining).toBe(0);

      // Deserialize and verify
      const deserializedListener = ListenerFactory.deserialize(serialized);
      expect(deserializedListener.instanceId).toBe('fatigue-player-1');
      expect(deserializedListener.playerId).toBe('player-1');
    });
  });
});
