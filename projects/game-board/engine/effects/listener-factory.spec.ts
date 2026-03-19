import { describe, expect, it } from 'vitest';
import { StatusEffect } from '../../item';
import { ListenerFactory } from './listener-factory';
import { createInitialListenerData } from './listener-factory';
import { EngineState, GameEvent, GameEventStatus } from '../engine.types';

describe('ListenerFactory', () => {
  const createMockEvent = (
    playerId: string = 'player-1',
    phase?: string,
    status: GameEventStatus = GameEventStatus.PROGRESS,
  ): GameEvent =>
    ({
      type: phase ? 'lifecycle' : 'effect',
      phase: phase,
      effect: phase
        ? undefined
        : { type: 'damage', value: 5, target: 'enemy' as const },
      playerId,
      status,
      processedBy: [],
    }) as unknown as GameEvent;

  const createMockState = (): EngineState =>
    ({
      playerOne: { id: 'player-1', items: [], health: 100, speed: 10 },
      playerTwo: { id: 'player-2', items: [], health: 100, speed: 10 },
      turnQueue: [],
      listeners: [],
      gameOver: false,
    }) as unknown as EngineState;

  describe('create data', () => {
    it('should create a listener data from StatusEffect with charges duration', () => {
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

      const Constructor = ListenerFactory.getConstructor(effect.type);
      const listener = new Constructor();

      expect(listenerData.instanceId).toBe('listener-1');
      expect(listenerData.playerId).toBe('player-1');
      expect(listener).toBeDefined();
      expect(typeof listener.handle).toBe('function');
    });

    it('should create a listener data from StatusEffect with turns duration', () => {
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

      const Constructor = ListenerFactory.getConstructor(effect.type);
      const listener = new Constructor();

      expect(listenerData.instanceId).toBe('listener-2');
      expect(listenerData.playerId).toBe('player-2');
      expect(typeof listener.handle).toBe('function');
    });
  });

  describe('handle round-trip', () => {
    it('should reduce charges after handle and preserve state through data update', () => {
      const effect: StatusEffect = {
        type: 'negate',
        condition: { type: 'on_turn_end' },
        action: [],
        duration: { type: 'charges', value: 2 },
        genre: 'basic',
        mergeStrategy: 'new',
      };

      let listenerData = createInitialListenerData(
        'listener-1',
        'player-1',
        effect,
      );

      const Constructor = ListenerFactory.getConstructor(effect.type);
      const listener = new Constructor();
      const mockEvent = createMockEvent('player-1', 'on_turn_end');
      const mockState = createMockState();

      // Handle the event - charges should be reduced
      const result = listener.handle(mockEvent, mockState, listenerData);
      listenerData = result.data;

      expect(listenerData.instanceId).toBe('listener-1');
      expect(listenerData.playerId).toBe('player-1');
      expect(listenerData.effectState.currentDuration.type).toBe('charges');
      expect(listenerData.effectState.currentDuration.remaining).toBe(1);

      // Handle event again - charges should be reduced again
      const result2 = listener.handle(mockEvent, mockState, listenerData);
      listenerData = result2.data;

      expect(listenerData.effectState.currentDuration.remaining).toBe(0);
    });

    it('should reduce turns after handle and preserve state through data update', () => {
      const effect: StatusEffect = {
        type: 'invert',
        condition: { type: 'on_turn_end' },
        action: [],
        duration: { type: 'turns', value: 3 },
        genre: 'basic',
        mergeStrategy: 'new',
      };

      let listenerData = createInitialListenerData(
        'listener-2',
        'player-2',
        effect,
      );

      const Constructor = ListenerFactory.getConstructor(effect.type);
      const listener = new Constructor();
      const mockEvent = createMockEvent('player-2', 'on_turn_end');
      const mockState = createMockState();

      // Handle the event - turns should be reduced
      const result = listener.handle(mockEvent, mockState, listenerData);
      listenerData = result.data;

      expect(listenerData.instanceId).toBe('listener-2');
      expect(listenerData.playerId).toBe('player-2');
      expect(listenerData.effectState.currentDuration.type).toBe('turns');
      expect(listenerData.effectState.currentDuration.remaining).toBe(2);

      // Handle event again - turns should be reduced again
      const result2 = listener.handle(mockEvent, mockState, listenerData);
      listenerData = result2.data;

      expect(listenerData.effectState.currentDuration.remaining).toBe(1);
    });
  });
});
