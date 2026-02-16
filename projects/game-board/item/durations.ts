import { Duration } from './item.model';

/**
 * Creates a duration based on turns.
 */
export function turns(value: number): Duration {
  return { type: 'turns', value };
}

/**
 * Creates a duration based on charges.
 */
export function charges(value: number): Duration {
  return { type: 'charges', value };
}

/**
 * Creates a permanent duration.
 */
export function permanent(): Duration {
  return { type: 'permanent' };
}
