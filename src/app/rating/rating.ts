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

export class PlayerRating implements Rating {
  private rating = 1200;
  private readonly kFactor = 32;

  get value(): number {
    return this.rating;
  }

  win(opponentRating: number): number {
    return this.updateRating(opponentRating, 1);
  }

  lose(opponentRating: number): number {
    return this.updateRating(opponentRating, 0);
  }

  private updateRating(opponentRating: number, outcome: number): number {
    const expectedOutcome = 1 / (1 + Math.pow(10, (opponentRating - this.rating) / 400));
    const ratingChange = Math.round(this.kFactor * (outcome - expectedOutcome));
    this.rating += ratingChange;
    return this.rating;
  }
}
