import { Rating } from '@dream/rating';
import { Loadout } from '@dream/item';
import { Strategy } from '@dream/ai';

/**
 * Represents a player in the game.
 */
export interface Player {
  readonly id: string;
  readonly name: string;
  readonly rating: Rating;
  readonly loadout: Loadout;
  readonly strategy: Strategy;
}
