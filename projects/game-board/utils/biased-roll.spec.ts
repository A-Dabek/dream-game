import { describe, it, expect, vi, beforeEach } from 'vitest';
import { biasedRoll } from './biased-roll';

describe('biasedRoll', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockClear();
  });

  it('should return the roll closest to expectedValue among 3 rolls', () => {
    // expectedValue is 3
    // min is -10, max is 10. range = 21.
    // Math.floor(Math.random() * 21) - 10

    // We want to mock Math.random to return specific values
    // Roll 1: 0.95 -> floor(0.95 * 21) - 10 = floor(19.95) - 10 = 19 - 10 = 9. Dist to 3: 6
    // Roll 2: 0.5 -> floor(0.5 * 21) - 10 = floor(10.5) - 10 = 10 - 10 = 0. Dist to 3: 3
    // Roll 3: 0.6 -> floor(0.6 * 21) - 10 = floor(12.6) - 10 = 12 - 10 = 2. Dist to 3: 1

    (Math.random as any)
      .mockReturnValueOnce(0.95) // 9
      .mockReturnValueOnce(0.5) // 0
      .mockReturnValueOnce(0.6); // 2

    const result = biasedRoll();
    expect(result).toBe(2);
    expect(Math.random).toHaveBeenCalledTimes(3);
  });

  it('should return the first roll in case of a tie', () => {
    // Roll 1: 0.5 -> 0. Dist to 3: 3
    // Roll 2: 0.762 -> floor(0.762 * 21) - 10 = floor(16.002) - 10 = 16 - 10 = 6. Dist to 3: 3
    // Roll 3: 0.95 -> 9. Dist to 3: 6

    (Math.random as any)
      .mockReturnValueOnce(0.5) // 0
      .mockReturnValueOnce(0.762) // 6
      .mockReturnValueOnce(0.95); // 9

    const result = biasedRoll();
    expect(result).toBe(0);
    expect(Math.random).toHaveBeenCalledTimes(3);
  });
});
