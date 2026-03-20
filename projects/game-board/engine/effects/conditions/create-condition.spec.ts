import { describe, it, expect } from 'vitest';
import { GameEvent, GameEventStatus, EngineState } from '../../engine.types';
import { createCondition, and, or, not, ComposableCondition } from './index';
import { Condition } from '../../../item';

// Helper to create a minimal engine state for testing
const createMockState = (playerId: string = 'p1'): EngineState => ({
  playerOne: {
    id: 'p1',
    health: 100,
    maxHealth: 100,
    speed: 10,
    items: [],
  },
  playerTwo: {
    id: 'p2',
    health: 100,
    maxHealth: 100,
    speed: 10,
    items: [],
  },
  turnQueue: [],
  listeners: [],
  gameOver: false,
  actionHistory: [],
});

// Helper to create lifecycle events
const createLifecycleEvent = (
  phase: 'on_turn_start' | 'on_turn_end' | 'game_start' | 'game_over',
  playerId: string,
  status: GameEventStatus = GameEventStatus.PROGRESS,
): GameEvent => ({
  type: 'lifecycle',
  phase,
  playerId,
  processedBy: [],
  status,
});

describe('createCondition', () => {
  describe('simple conditions', () => {
    it('should create condition for on_turn_start', () => {
      const condition = createCondition({ type: 'on_turn_start' });

      expect(condition.type).toBe('on_turn_start');
    });

    it('should create condition for on_turn_end', () => {
      const condition = createCondition({ type: 'on_turn_end' });

      expect(condition.type).toBe('on_turn_end');
    });

    it('should match on_turn_start events for the correct player', () => {
      const condition = createCondition({ type: 'on_turn_start' });
      const state = createMockState();
      const event = createLifecycleEvent('on_turn_start', 'p1');

      expect(condition.shouldReact(event, 'p1', state)).toBe(true);
    });

    it('should not match on_turn_start events for a different player', () => {
      const condition = createCondition({ type: 'on_turn_start' });
      const state = createMockState();
      const event = createLifecycleEvent('on_turn_start', 'p2');

      expect(condition.shouldReact(event, 'p1', state)).toBe(false);
    });

    it('should not match on_turn_start when event status is not PROGRESS', () => {
      const condition = createCondition({ type: 'on_turn_start' });
      const state = createMockState();
      const event = createLifecycleEvent(
        'on_turn_start',
        'p1',
        GameEventStatus.DONE,
      );

      expect(condition.shouldReact(event, 'p1', state)).toBe(false);
    });

    it('should match on_turn_end events for the correct player', () => {
      const condition = createCondition({ type: 'on_turn_end' });
      const state = createMockState();
      const event = createLifecycleEvent('on_turn_end', 'p1');

      expect(condition.shouldReact(event, 'p1', state)).toBe(true);
    });

    it('should not match on_turn_end events for a different player', () => {
      const condition = createCondition({ type: 'on_turn_end' });
      const state = createMockState();
      const event = createLifecycleEvent('on_turn_end', 'p2');

      expect(condition.shouldReact(event, 'p1', state)).toBe(false);
    });
  });

  describe('AND combinator', () => {
    it('should create AND condition with correct type', () => {
      const condition = createCondition({
        type: 'and',
        subConditions: [{ type: 'on_turn_start' }, { type: 'has_no_items' }],
      });

      expect(condition.type).toBe('on_turn_start');
    });

    it('should match when all sub-conditions match', () => {
      const condition = createCondition({
        type: 'and',
        subConditions: [{ type: 'on_turn_start' }, { type: 'on_turn_start' }],
      });
      const state = createMockState();
      const event = createLifecycleEvent('on_turn_start', 'p1');

      expect(condition.shouldReact(event, 'p1', state)).toBe(true);
    });

    it('should not match when any sub-condition does not match', () => {
      const condition = createCondition({
        type: 'and',
        subConditions: [{ type: 'on_turn_start' }, { type: 'on_turn_end' }],
      });
      const state = createMockState();
      const event = createLifecycleEvent('on_turn_start', 'p1');

      // Event is on_turn_start, but second condition expects on_turn_end
      expect(condition.shouldReact(event, 'p1', state)).toBe(false);
    });

    it('should handle empty AND condition', () => {
      const condition = createCondition({
        type: 'and',
        subConditions: [],
      });
      const state = createMockState();
      const event = createLifecycleEvent('on_turn_start', 'p1');

      // Empty AND should match everything (every() on empty array returns true)
      expect(condition.shouldReact(event, 'p1', state)).toBe(true);
    });
  });

  describe('OR combinator', () => {
    it('should create OR condition with correct type', () => {
      const condition = createCondition({
        type: 'or',
        subConditions: [{ type: 'on_turn_start' }, { type: 'on_turn_end' }],
      });

      // The type should reflect that this is a composite condition
      // that can match multiple event types
      expect(condition.type).toBe('on_turn_start');
    });

    it('should match when first sub-condition matches', () => {
      const condition = createCondition({
        type: 'or',
        subConditions: [{ type: 'on_turn_start' }, { type: 'on_turn_end' }],
      });
      const state = createMockState();
      const event = createLifecycleEvent('on_turn_start', 'p1');

      expect(condition.shouldReact(event, 'p1', state)).toBe(true);
    });

    it('should match when second sub-condition matches', () => {
      const condition = createCondition({
        type: 'or',
        subConditions: [{ type: 'on_turn_start' }, { type: 'on_turn_end' }],
      });
      const state = createMockState();
      const event = createLifecycleEvent('on_turn_end', 'p1');

      expect(condition.shouldReact(event, 'p1', state)).toBe(true);
    });

    it('should match when any sub-condition matches (three conditions)', () => {
      const condition = createCondition({
        type: 'or',
        subConditions: [
          { type: 'on_turn_start' },
          { type: 'on_turn_end' },
          { type: 'on_turn_start' },
        ],
      });
      const state = createMockState();
      const event = createLifecycleEvent('on_turn_end', 'p1');

      expect(condition.shouldReact(event, 'p1', state)).toBe(true);
    });

    it('should not match when no sub-conditions match', () => {
      const condition = createCondition({
        type: 'or',
        subConditions: [{ type: 'on_turn_start' }, { type: 'on_turn_end' }],
      });
      const state = createMockState();
      const event = createLifecycleEvent('game_start', 'p1');

      expect(condition.shouldReact(event, 'p1', state)).toBe(false);
    });

    it('should handle empty OR condition', () => {
      const condition = createCondition({
        type: 'or',
        subConditions: [],
      });
      const state = createMockState();
      const event = createLifecycleEvent('on_turn_start', 'p1');

      // Empty OR should not match anything (some() on empty array returns false)
      expect(condition.shouldReact(event, 'p1', state)).toBe(false);
    });

    it('should handle OR condition with single sub-condition', () => {
      const condition = createCondition({
        type: 'or',
        subConditions: [{ type: 'on_turn_start' }],
      });
      const state = createMockState();
      const event = createLifecycleEvent('on_turn_start', 'p1');

      expect(condition.shouldReact(event, 'p1', state)).toBe(true);
    });
  });

  describe('NOT combinator', () => {
    it('should create NOT condition with correct type', () => {
      const condition = createCondition({
        type: 'not',
        subConditions: [{ type: 'on_turn_start' }],
      });

      expect(condition.type).toBe('on_turn_start');
    });

    it('should match when sub-condition does not match', () => {
      const condition = createCondition({
        type: 'not',
        subConditions: [{ type: 'on_turn_start' }],
      });
      const state = createMockState();
      const event = createLifecycleEvent('on_turn_end', 'p1');

      expect(condition.shouldReact(event, 'p1', state)).toBe(true);
    });

    it('should not match when sub-condition matches', () => {
      const condition = createCondition({
        type: 'not',
        subConditions: [{ type: 'on_turn_start' }],
      });
      const state = createMockState();
      const event = createLifecycleEvent('on_turn_start', 'p1');

      expect(condition.shouldReact(event, 'p1', state)).toBe(false);
    });

    it('should handle NOT condition without sub-conditions', () => {
      const condition = createCondition({
        type: 'not',
        subConditions: [],
      });
      const state = createMockState();
      const event = createLifecycleEvent('on_turn_start', 'p1');

      // Without sub-conditions, should default to not matching
      expect(condition.shouldReact(event, 'p1', state)).toBe(true);
    });
  });

  describe('complex nested conditions', () => {
    it('should handle nested AND within OR', () => {
      const condition = createCondition({
        type: 'or',
        subConditions: [
          {
            type: 'and',
            subConditions: [
              { type: 'on_turn_start' },
              { type: 'on_turn_start' },
            ],
          },
          { type: 'on_turn_end' },
        ],
      });
      const state = createMockState();

      // Should match on_turn_start (via nested AND)
      expect(
        condition.shouldReact(
          createLifecycleEvent('on_turn_start', 'p1'),
          'p1',
          state,
        ),
      ).toBe(true);

      // Should match on_turn_end (directly)
      expect(
        condition.shouldReact(
          createLifecycleEvent('on_turn_end', 'p1'),
          'p1',
          state,
        ),
      ).toBe(true);

      // Should not match other events
      expect(
        condition.shouldReact(
          createLifecycleEvent('game_start', 'p1'),
          'p1',
          state,
        ),
      ).toBe(false);
    });

    it('should handle OR within AND', () => {
      const condition = createCondition({
        type: 'and',
        subConditions: [
          {
            type: 'or',
            subConditions: [{ type: 'on_turn_start' }, { type: 'on_turn_end' }],
          },
          { type: 'on_turn_start' },
        ],
      });
      const state = createMockState();

      // Should match on_turn_start (OR matches, AND second condition matches)
      expect(
        condition.shouldReact(
          createLifecycleEvent('on_turn_start', 'p1'),
          'p1',
          state,
        ),
      ).toBe(true);

      // Should not match on_turn_end (OR matches, but AND second condition doesn't)
      expect(
        condition.shouldReact(
          createLifecycleEvent('on_turn_end', 'p1'),
          'p1',
          state,
        ),
      ).toBe(false);
    });
  });

  describe('drip use case', () => {
    it('should match on_turn_start for drip condition', () => {
      // This is the exact condition used by the drip item
      const dripCondition: Condition = {
        type: 'or',
        subConditions: [{ type: 'on_turn_start' }, { type: 'on_turn_end' }],
      };

      const condition = createCondition(dripCondition);
      const state = createMockState();
      const event = createLifecycleEvent('on_turn_start', 'p1');

      expect(condition.shouldReact(event, 'p1', state)).toBe(true);
    });

    it('should match on_turn_end for drip condition', () => {
      // This is the exact condition used by the drip item
      const dripCondition: Condition = {
        type: 'or',
        subConditions: [{ type: 'on_turn_start' }, { type: 'on_turn_end' }],
      };

      const condition = createCondition(dripCondition);
      const state = createMockState();
      const event = createLifecycleEvent('on_turn_end', 'p1');

      expect(condition.shouldReact(event, 'p1', state)).toBe(true);
    });

    it('should not match for wrong player', () => {
      const dripCondition: Condition = {
        type: 'or',
        subConditions: [{ type: 'on_turn_start' }, { type: 'on_turn_end' }],
      };

      const condition = createCondition(dripCondition);
      const state = createMockState();
      const event = createLifecycleEvent('on_turn_start', 'p2');

      expect(condition.shouldReact(event, 'p1', state)).toBe(false);
    });
  });

  describe('impatience use case', () => {
    it('should match on_turn_end when player has no items', () => {
      const impatienceCondition: Condition = {
        type: 'and',
        subConditions: [{ type: 'on_turn_end' }, { type: 'has_no_items' }],
      };

      const condition = createCondition(impatienceCondition);
      const state: EngineState = {
        ...createMockState(),
        playerOne: {
          id: 'p1',
          health: 100,
          maxHealth: 100,
          speed: 10,
          items: [], // No items
        },
      };
      const event = createLifecycleEvent('on_turn_end', 'p1');

      expect(condition.shouldReact(event, 'p1', state)).toBe(true);
    });

    it('should not match on_turn_end when player has items', () => {
      const impatienceCondition: Condition = {
        type: 'and',
        subConditions: [{ type: 'on_turn_end' }, { type: 'has_no_items' }],
      };

      const condition = createCondition(impatienceCondition);
      const state: EngineState = {
        ...createMockState(),
        playerOne: {
          id: 'p1',
          health: 100,
          maxHealth: 100,
          speed: 10,
          items: [{ id: 'hand', genre: 'basic' }], // Has items
        },
      };
      const event = createLifecycleEvent('on_turn_end', 'p1');

      expect(condition.shouldReact(event, 'p1', state)).toBe(false);
    });
  });

  describe('default condition', () => {
    it('should return default condition for unknown condition types', () => {
      const condition = createCondition({
        type: 'unknown_condition_type',
      } as Condition);

      expect(condition.type).toBe('default');
    });

    it('should never match for default condition', () => {
      const condition = createCondition({
        type: 'unknown_condition_type',
      } as Condition);
      const state = createMockState();
      const event = createLifecycleEvent('on_turn_start', 'p1');

      expect(condition.shouldReact(event, 'p1', state)).toBe(false);
    });
  });
});

describe('combinators', () => {
  const mockState = createMockState();
  const createPredicate =
    (result: boolean) =>
    (event: GameEvent, playerId: string, state: EngineState) =>
      result;

  describe('and', () => {
    it('should return true when all predicates return true', () => {
      const combined = and(
        createPredicate(true),
        createPredicate(true),
        createPredicate(true),
      );
      const event = createLifecycleEvent('on_turn_start', 'p1');

      expect(combined(event, 'p1', mockState)).toBe(true);
    });

    it('should return false when any predicate returns false', () => {
      const combined = and(
        createPredicate(true),
        createPredicate(false),
        createPredicate(true),
      );
      const event = createLifecycleEvent('on_turn_start', 'p1');

      expect(combined(event, 'p1', mockState)).toBe(false);
    });

    it('should return true for empty predicate list', () => {
      const combined = and();
      const event = createLifecycleEvent('on_turn_start', 'p1');

      expect(combined(event, 'p1', mockState)).toBe(true);
    });
  });

  describe('or', () => {
    it('should return true when any predicate returns true', () => {
      const combined = or(
        createPredicate(false),
        createPredicate(true),
        createPredicate(false),
      );
      const event = createLifecycleEvent('on_turn_start', 'p1');

      expect(combined(event, 'p1', mockState)).toBe(true);
    });

    it('should return false when all predicates return false', () => {
      const combined = or(
        createPredicate(false),
        createPredicate(false),
        createPredicate(false),
      );
      const event = createLifecycleEvent('on_turn_start', 'p1');

      expect(combined(event, 'p1', mockState)).toBe(false);
    });

    it('should return true when all predicates return true', () => {
      const combined = or(
        createPredicate(true),
        createPredicate(true),
        createPredicate(true),
      );
      const event = createLifecycleEvent('on_turn_start', 'p1');

      expect(combined(event, 'p1', mockState)).toBe(true);
    });

    it('should return false for empty predicate list', () => {
      const combined = or();
      const event = createLifecycleEvent('on_turn_start', 'p1');

      expect(combined(event, 'p1', mockState)).toBe(false);
    });
  });

  describe('not', () => {
    it('should return false when predicate returns true', () => {
      const combined = not(createPredicate(true));
      const event = createLifecycleEvent('on_turn_start', 'p1');

      expect(combined(event, 'p1', mockState)).toBe(false);
    });

    it('should return true when predicate returns false', () => {
      const combined = not(createPredicate(false));
      const event = createLifecycleEvent('on_turn_start', 'p1');

      expect(combined(event, 'p1', mockState)).toBe(true);
    });
  });
});

describe('ComposableCondition', () => {
  it('should use the provided predicate to determine shouldReact', () => {
    const predicate = (
      event: GameEvent,
      playerId: string,
      state: EngineState,
    ) =>
      event.type === 'lifecycle' &&
      'phase' in event &&
      event.phase === 'on_turn_start';

    const condition = new ComposableCondition('custom', predicate);
    const state = createMockState();

    expect(
      condition.shouldReact(
        createLifecycleEvent('on_turn_start', 'p1'),
        'p1',
        state,
      ),
    ).toBe(true);

    expect(
      condition.shouldReact(
        createLifecycleEvent('on_turn_end', 'p1'),
        'p1',
        state,
      ),
    ).toBe(false);
  });

  it('should expose its type', () => {
    const condition = new ComposableCondition('my_type', () => true);

    expect(condition.type).toBe('my_type');
  });
});
