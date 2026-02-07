import { describe, expect, it } from 'vitest';
import { TurnManager } from './turn-manager';

describe('TurnManager', () => {
  const p1 = { id: 'p1', speed: 10 };
  const p2 = { id: 'p2', speed: 10 };

  it('generates turn entries with stable IDs', () => {
    const tm = new TurnManager(p1, p2);
    const turns = tm.getNextTurns(5);

    expect(turns.map((t) => t.playerId)).toEqual([
      'p2',
      'p1',
      'p2',
      'p1',
      'p2',
    ]);
    expect(turns.map((t) => t.id)).toEqual([
      'p2-0',
      'p1-0',
      'p2-1',
      'p1-1',
      'p2-2',
    ]);
  });

  it('shifts the queue when advancing and appends a new entry', () => {
    const tm = new TurnManager(p1, p2);
    const initial = tm.getNextTurns(10);

    tm.advanceTurn();
    const next = tm.getNextTurns(10);

    expect(next[0].id).toBe(initial[1].id);
    expect(next[0].playerId).toBe('p1');
    expect(next[next.length - 1].id).toBe('p2-5');
    expect(next.map((turn) => turn.playerId)).toEqual([
      'p1',
      'p2',
      'p1',
      'p2',
      'p1',
      'p2',
      'p1',
      'p2',
      'p1',
      'p2',
    ]);
  });

  it('refresh keeps the active entry and reuses IDs when nothing changes', () => {
    const tm = new TurnManager(p1, p2);
    const initial = tm.getNextTurns(5);

    const refreshed = tm.refresh(10, 10, initial[0], 5);

    expect(refreshed[0]).toBe(initial[0]);
    expect(refreshed.map((turn) => turn.id)).toEqual(
      initial.map((turn) => turn.id),
    );
  });
});
