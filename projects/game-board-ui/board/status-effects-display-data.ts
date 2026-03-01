import { StatusEffectData, Genre } from '@dream/game-board';

/**
 * Extends StatusEffectData with UI-specific display properties.
 * This interface decouples the UI layer from the domain model while
 * allowing the component to access display-derived data.
 */
export interface StatusEffectDisplayData extends StatusEffectData {
  readonly pathD: string;
  readonly genre: Genre;
}
