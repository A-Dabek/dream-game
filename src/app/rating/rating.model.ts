/**
 * Represents the rating system for players, similar to the Elo rating system.
 */
export interface Rating {
  readonly value: number;

  /**
   * Update rating after winning against an opponent
   */
  win(opponentRating: number): number;

  /**
   * Update rating after losing to an opponent
   */
  lose(opponentRating: number): number;
}
