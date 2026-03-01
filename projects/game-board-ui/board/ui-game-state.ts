import { GameState } from '@dream/game-board';
import { StatusEffectDisplayData } from './status-effects-display-data';

/**
 * Extends GameState with UI-specific display properties.
 * This interface is used by the UI layer to represent the game state
 * with enriched data like status effect icons and genres.
 */
export interface UiGameState extends Omit<
  GameState,
  'playerStatusEffects' | 'opponentStatusEffects'
> {
  readonly playerStatusEffects: StatusEffectDisplayData[];
  readonly opponentStatusEffects: StatusEffectDisplayData[];
}
