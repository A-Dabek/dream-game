/**
 * Game balance configuration
 * Centralized baseline values and modifiers for easy game balancing.
 */
export const GAME_CONFIG = {
  /** Average player health baseline */
  BASE_HEALTH: 20,
  /** Baseline attack damage */
  BASE_ATTACK: 5,
  /** Heal is 120% of attack damage */
  HEAL_MODIFIER: 1.2,
} as const;

/**
 * Derived values calculated from configuration.
 * HEAL is always an integer (floored).
 */
export const BASE_HEAL = Math.floor(
  GAME_CONFIG.BASE_ATTACK * GAME_CONFIG.HEAL_MODIFIER,
);
