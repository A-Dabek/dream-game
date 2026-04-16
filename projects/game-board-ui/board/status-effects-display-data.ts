import { StatusEffectData } from '@dream/game-board';
import { Genre, IconName } from '@dream/shared-basic';

/**
 * Extends StatusEffectData with UI-specific display properties.
 * This interface decouples the UI layer from the domain model while
 * allowing the component to access display-derived data.
 */
export interface StatusEffectDisplayData extends StatusEffectData {
  readonly name: string;
  readonly iconName: IconName;
  readonly genre: Genre;
}
