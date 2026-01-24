import { describe, expect, it } from 'vitest';
import { TurnManager } from './turn-manager';

describe('TurnManager', () => {
  const p1 = { id: 'p1', speed: 10 };
  const p2 = { id: 'p2', speed: 10 };

  it('should initialize and give next turns', () => {
    const tm = new TurnManager(p1, p2);
    const turns = tm.getNextTurns(5);
    expect(turns.length).toBe(5);
    // With equal speed 10, 10, total 20. err starts at 10.
    // 1. err = 10 - 10 = 0. else -> p2.
    // 2. err = 0 - 10 = -10. if -> p1. err = -10 + 20 = 10.
    // 3. err = 10 - 10 = 0. else -> p2.
    // ...
    expect(turns).toEqual(['p2', 'p1', 'p2', 'p1', 'p2']);
  });

  it('should advance turns', () => {
    const tm = new TurnManager(p1, p2);
    expect(tm.getNextTurns(2)).toEqual(['p2', 'p1']);

    tm.advanceTurn();
    expect(tm.getNextTurns(2)).toEqual(['p1', 'p2']);

    tm.advanceTurn();
    expect(tm.getNextTurns(2)).toEqual(['p2', 'p1']);
  });

  it('should handle speed 0', () => {
    const tm = new TurnManager({ id: 'p1', speed: 0 }, { id: 'p2', speed: 0 });
    expect(tm.getNextTurns(3)).toEqual(['p1', 'p1', 'p1']);
  });

  it('should refresh with new speeds and first player', () => {
    const tm = new TurnManager(p1, p2);
    tm.refresh(20, 10, 'p1');
    const turns = tm.getNextTurns(3);
    expect(turns[0]).toBe('p1');
    // s1=20, s2=10, total=30. err=0.
    // 1. err = 0 - 20 = -20. if -> p1. err = -20 + 30 = 10.
    // 2. err = 10 - 20 = -10. if -> p1. err = -10 + 30 = 20.
    // 3. err = 20 - 20 = 0. else -> p2.
    expect(turns).toEqual(['p1', 'p1', 'p2']);
  });

  it('should clone correctly', () => {
    const tm = new TurnManager(
      { id: 'p1', speed: 13 },
      { id: 'p2', speed: 16 },
    );
    tm.advanceTurn();
    tm.advanceTurn();

    const cloned = tm.clone();
    expect(cloned.getNextTurns(10)).toEqual(tm.getNextTurns(10));

    cloned.advanceTurn();
    expect(cloned.getNextTurns(5)).not.toEqual(tm.getNextTurns(5));
  });

  it('should support getter for next turns', () => {
    const tm = new TurnManager(p1, p2);
    expect(tm.nextTurns.length).toBe(10);
  });
});
