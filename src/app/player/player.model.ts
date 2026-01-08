import { Rating } from '../rating';
import { Loadout } from '../item';
import { Strategy } from '../ai';

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
