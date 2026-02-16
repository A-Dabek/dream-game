import { describe, expect, it } from 'vitest';
import { TurnManager } from './turn-manager';

describe('TurnManager', () => {
  const p1 = { id: 'p1', speed: 10 };
  const p2 = { id: 'p2', speed: 10 };

  it('initializes the queue with player-specific turn IDs', () => {
    const queue = TurnManager.initializeTurnQueue(p1, p2, 5);

    expect(queue.map((entry) => entry.playerId)).toEqual([
      'p2',
      'p1',
      'p2',
      'p1',
      'p2',
    ]);
    expect(queue.map((entry) => entry.accumulatedError)).toEqual([
      0, 10, 0, 10, 0,
    ]);
    expect(queue.map((entry) => entry.turnId)).toEqual([
      'p2-0',
      'p1-0',
      'p2-1',
      'p1-1',
      'p2-2',
    ]);
  });

  it('keeps turn IDs stable when advancing a single turn', () => {
    const queue = TurnManager.initializeTurnQueue(p1, p2, 5);
    const advanced = TurnManager.advanceTurnQueue(p1, p2, queue, 1);

    expect(advanced.map((entry) => entry.turnId)).toEqual([
      'p1-0',
      'p2-1',
      'p1-1',
      'p2-2',
      'p1-2',
    ]);
    expect(advanced[advanced.length - 1].accumulatedError).toBe(10);
  });

  it('continues per-player counters when multiple turns advance', () => {
    const queue = TurnManager.initializeTurnQueue(p1, p2, 5);
    const advanced = TurnManager.advanceTurnQueue(p1, p2, queue, 2);

    expect(advanced.map((entry) => entry.turnId)).toEqual([
      'p2-1',
      'p1-1',
      'p2-2',
      'p1-2',
      'p2-3',
    ]);
  });

  it('recalculates the tail while reusing overlapping turn IDs', () => {
    const queue = TurnManager.initializeTurnQueue(p1, p2, 5);
    const faster = { id: 'p1', speed: 20 };
    const recalculated = TurnManager.recalculateTurnQueue(faster, p2, queue);

    expect(recalculated[0]).toEqual(queue[0]);
    expect(recalculated.map((entry) => entry.playerId)).toEqual([
      'p2',
      'p1',
      'p1',
      'p2',
      'p1',
    ]);
    expect(recalculated.slice(1).map((entry) => entry.turnId)).toEqual([
      'p1-0',
      'p1-1',
      'p2-2',
      'p1-2',
    ]);
  });
});
