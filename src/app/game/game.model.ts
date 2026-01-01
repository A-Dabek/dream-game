import {BoardService, Player} from '../board';
import { MatchResult, Score } from '../scoring';

/**
 * Encapsulates player intelligence with game decision-making capability
 * using the visitor pattern
 */
export interface PlayerIntelligence {
  readonly player: Player;
  score: Score;

  /**
   * Makes a decision by directly interacting with the board service
   * @param board The board service instance that this intelligence will interact with
   */
  makeDecision(board: BoardService): Promise<void>;
}

/**
 * Configuration for initializing a game
 */
export interface GameConfig {
  readonly playerOne: PlayerIntelligence;
  readonly playerTwo: PlayerIntelligence;
}

/**
 * Result of a completed game
 */
export interface GameResult {
  readonly playerOne: PlayerIntelligence;
  readonly playerTwo: PlayerIntelligence;
  readonly winnerId: string | null;
  readonly outcome: MatchResult;
}
