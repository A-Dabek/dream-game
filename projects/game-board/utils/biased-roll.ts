// Configurable bounds and target — change these to adjust the roll range and bias.
let min = -10;
let max = 10;
let expectedValue = 3;
let rolls = 3;

/**
 * Rolls within [min, max] 'rolls' times and returns the value closer to expectedValue.
 * Ties go to the first roll.
 */
export function biasedRoll(): number {
  const range = max - min + 1;
  let bestRoll = Math.floor(Math.random() * range) + min;
  for (let i = 1; i < rolls; i++) {
    const nextRoll = Math.floor(Math.random() * range) + min;
    if (
      Math.abs(nextRoll - expectedValue) < Math.abs(bestRoll - expectedValue)
    ) {
      bestRoll = nextRoll;
    }
  }
  return bestRoll;
}
