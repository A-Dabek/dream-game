import { Injectable } from '@angular/core';
import { Score, MatchResult } from './score.model';

@Injectable({
  providedIn: 'root'
})
export class ScoringService {
  K_FACTOR = 32;

  /**
   * Calculate the new ELO rating for a player based on match outcome.
   * Note: We intentionally do not enforce rating boundaries (e.g., 0–3000).
   * Rating validation is the responsibility of the consumer.
   */
  calculateNewRating(playerScore: Score, opponentScore: Score, result: MatchResult): Score {
    const expectedScore = this.calculateExpectedScore(playerScore.rating, opponentScore.rating);
    const actualScore = this.getActualScore(result);
    const ratingChange = this.K_FACTOR * (actualScore - expectedScore);
    const newRating = playerScore.rating + ratingChange;

    return {
      rating: newRating,
      matchesPlayed: playerScore.matchesPlayed + 1
    };
  }

  private calculateExpectedScore(playerRating: number, opponentRating: number): number {
    const ratingDifference = opponentRating - playerRating;
    return 1 / (1 + Math.pow(10, ratingDifference / 400));
  }

  private getActualScore(result: MatchResult): number {
    switch (result) {
      case MatchResult.WIN:
        return 1;
      case MatchResult.LOSS:
        return 0;
      case MatchResult.DRAW:
        return 0.5;
    }
  }
}

