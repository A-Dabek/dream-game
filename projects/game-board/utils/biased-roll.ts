// Configurable bounds and target — change these to adjust the roll range and bias.
let min = -10;
let max = 10;
let expectedValue = 3;

/**
 * Rolls twice within [min, max] and returns the value closer to expectedValue.
 * Ties go to the first roll.
 */
export function biasedRoll(): number {
  const range = max - min + 1;
  const rollA = Math.floor(Math.random() * range) + min;
  const rollB = Math.floor(Math.random() * range) + min;
  return Math.abs(rollA - expectedValue) <= Math.abs(rollB - expectedValue)
    ? rollA
    : rollB;
}
