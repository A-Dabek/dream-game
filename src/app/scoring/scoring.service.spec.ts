import { TestBed } from '@angular/core/testing';
import { ScoringService } from './scoring.service';
import { Score, MatchResult } from './score.model';

describe('ScoringService', () => {
  let service: ScoringService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScoringService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculateNewRating', () => {
    it('should increase rating when player wins', () => {
      const playerScore: Score = { rating: 1600, matchesPlayed: 10 };
      const opponentScore: Score = { rating: 1400, matchesPlayed: 8 };

      const newScore = service.calculateNewRating(playerScore, opponentScore, MatchResult.WIN);

      expect(newScore.rating).toBeGreaterThan(playerScore.rating);
      expect(newScore.matchesPlayed).toBe(11);
    });

    it('should decrease rating when player loses', () => {
      const playerScore: Score = { rating: 1600, matchesPlayed: 10 };
      const opponentScore: Score = { rating: 1400, matchesPlayed: 8 };

      const newScore = service.calculateNewRating(playerScore, opponentScore, MatchResult.LOSS);

      expect(newScore.rating).toBeLessThan(playerScore.rating);
      expect(newScore.matchesPlayed).toBe(11);
    });

    it('should slightly increase rating when stronger player wins', () => {
      const playerScore: Score = { rating: 1600, matchesPlayed: 10 };
      const opponentScore: Score = { rating: 1400, matchesPlayed: 8 };

      const newScore = service.calculateNewRating(playerScore, opponentScore, MatchResult.WIN);
      const ratingChange = newScore.rating - playerScore.rating;

      expect(ratingChange).toBeLessThan(32); // Less than max K-factor
    });

    it('should give more points when weaker player wins', () => {
      const weakerScore: Score = { rating: 1400, matchesPlayed: 8 };
      const strongerScore: Score = { rating: 1600, matchesPlayed: 10 };

      const newScore = service.calculateNewRating(weakerScore, strongerScore, MatchResult.WIN);
      const ratingChange = newScore.rating - weakerScore.rating;

      expect(ratingChange).toBeGreaterThan(0);
    });

    it('should handle draw correctly', () => {
      const playerScore: Score = { rating: 1600, matchesPlayed: 10 };
      const opponentScore: Score = { rating: 1600, matchesPlayed: 10 };

      const newScore = service.calculateNewRating(playerScore, opponentScore, MatchResult.DRAW);

      expect(newScore.rating).toBe(playerScore.rating); // Equal ratings, equal draw
      expect(newScore.matchesPlayed).toBe(11);
    });

    it('should increment match count on any result', () => {
      const playerScore: Score = { rating: 1600, matchesPlayed: 10 };
      const opponentScore: Score = { rating: 1400, matchesPlayed: 8 };

      const winScore = service.calculateNewRating(playerScore, opponentScore, MatchResult.WIN);
      const lossScore = service.calculateNewRating(playerScore, opponentScore, MatchResult.LOSS);
      const drawScore = service.calculateNewRating(playerScore, opponentScore, MatchResult.DRAW);

      expect(winScore.matchesPlayed).toBe(11);
      expect(lossScore.matchesPlayed).toBe(11);
      expect(drawScore.matchesPlayed).toBe(11);
    });

    it('should use K_FACTOR in calculation', () => {
      const playerScore: Score = { rating: 1600, matchesPlayed: 10 };
      const opponentScore: Score = { rating: 1600, matchesPlayed: 10 };

      const newScore = service.calculateNewRating(playerScore, opponentScore, MatchResult.WIN);
      const ratingChange = newScore.rating - playerScore.rating;

      // With equal ratings, expected score is 0.5, actual is 1.0, so change is 0.5 * K_FACTOR
      expect(ratingChange).toBe(0.5 * service.K_FACTOR);
    });
  });
});

