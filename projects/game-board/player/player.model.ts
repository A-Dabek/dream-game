import { Rating } from '@dream/game-board';
import { Strategy } from '../ai';
import { Loadout } from '../item';

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
