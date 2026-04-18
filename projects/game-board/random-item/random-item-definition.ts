import type { ActiveRandomEffect } from '../effect-library/active-effects';

/**
 * Strictly typed effect for randomly generated items.
 * Uses factory functions from ActiveEffectLibrary to ensure consistency.
 */
export type RandomEffectDefinition = ActiveRandomEffect;

export interface RandomItemDefinition {
  id: string;
  icon: string;
  onPlayEffects: RandomEffectDefinition[];
}
