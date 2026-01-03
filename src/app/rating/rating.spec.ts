import {beforeEach, describe, expect, it} from 'vitest';
import {PlayerRating} from './rating';


describe('PlayerRating', () => {
  let playerRating: PlayerRating;

  beforeEach(() => {
    playerRating = new PlayerRating();
  });

  describe('initialization', () => {
    it('should initialize with default rating of 1200', () => {
      expect(playerRating.value).toBe(1200);
    });
  });

  describe('win method', () => {
    it('should increase rating when winning against an equal opponent', () => {
      const initialRating = playerRating.value;
      const newRating = playerRating.win(1200);

      expect(newRating).toBe(initialRating + 16); // Expected outcome 0.5, so gain is 32 * (1 - 0.5) = 16
      expect(playerRating.value).toBe(newRating);
    });

    it('should increase rating more when winning against a higher-rated opponent', () => {
      const initialRating = playerRating.value;
      const newRating = playerRating.win(1400);

      expect(newRating).toBeGreaterThan(initialRating + 16);
      expect(playerRating.value).toBe(newRating);
    });

    it('should increase rating less when winning against a lower-rated opponent', () => {
      const initialRating = playerRating.value;
      const newRating = playerRating.win(1000);

      expect(newRating).toBeLessThan(initialRating + 16);
      expect(playerRating.value).toBe(newRating);
    });

    it('should calculate expected gain for specific rating differences', () => {
      // Against 200 points stronger opponent (expected ~0.24)
      expect(playerRating.win(1400)).toBe(1200 + Math.round(32 * (1 - 0.24)));

      // Against 400 points stronger opponent (expected ~0.09)
      playerRating = new PlayerRating(); // Reset
      expect(playerRating.win(1600)).toBe(1200 + Math.round(32 * (1 - 0.09)));
    });
  });

  describe('lose method', () => {
    it('should decrease rating when losing to an equal opponent', () => {
      const initialRating = playerRating.value;
      const newRating = playerRating.lose(1200);

      expect(newRating).toBe(initialRating - 16); // Expected outcome 0.5, so loss is 32 * (0 - 0.5) = -16
      expect(playerRating.value).toBe(newRating);
    });

    it('should decrease rating less when losing to a higher-rated opponent', () => {
      const initialRating = playerRating.value;
      const newRating = playerRating.lose(1400);

      expect(newRating).toBeGreaterThan(initialRating - 16);
      expect(playerRating.value).toBe(newRating);
    });

    it('should decrease rating more when losing to a lower-rated opponent', () => {
      const initialRating = playerRating.value;
      const newRating = playerRating.lose(1000);

      expect(newRating).toBeLessThan(initialRating - 16);
      expect(playerRating.value).toBe(newRating);
    });

    it('should calculate expected loss for specific rating differences', () => {
      // Against 200 points weaker opponent (expected ~0.76)
      expect(playerRating.lose(1000)).toBe(1200 + Math.round(32 * (0 - 0.76)));

      // Against 400 points weaker opponent (expected ~0.91)
      playerRating = new PlayerRating(); // Reset
      expect(playerRating.lose(800)).toBe(1200 + Math.round(32 * (0 - 0.91)));
    });
  });

  describe('full match scenarios', () => {
    it('should correctly adjust ratings for both players after a match', () => {
      const player1 = new PlayerRating();
      const player2 = new PlayerRating();

      // Player 1 wins
      const player1NewRating = player1.win(player2.value);
      const player2NewRating = player2.lose(player1.value);

      expect(player1NewRating).toBe(1216);
      expect(player2NewRating).toBe(1185);
      expect(player1.value).toBe(1216);
      expect(player2.value).toBe(1185);
      expect(player1.value + player2.value).toBe(2401); // Total rating should be preserved
    });

    it('should correctly adjust ratings when higher-rated player wins', () => {
      const player1 = new PlayerRating();
      // Simulate player1 having already won some matches
      player1.win(1200);
      player1.win(1200);

      const player2 = new PlayerRating();

      const player1InitialRating = player1.value;
      const player2InitialRating = player2.value;

      player1.win(player2.value);
      player2.lose(player1.value);

      expect(player1.value).toBeGreaterThan(player1InitialRating);
      expect(player2.value).toBeLessThan(player2InitialRating);
      expect(player1.value - player1InitialRating).toBeLessThan(16); // Should gain less than 16 points
    });

    it('should correctly adjust ratings when lower-rated player wins (upset)', () => {
      const player1 = new PlayerRating();

      const player2 = new PlayerRating();
      // Simulate player2 having already won some matches
      player2.win(1200);
      player2.win(1200);

      const player1InitialRating = player1.value;
      const player2InitialRating = player2.value;

      player1.win(player2.value);
      player2.lose(player1.value);

      expect(player1.value).toBeGreaterThan(player1InitialRating);
      expect(player2.value).toBeLessThan(player2InitialRating);
      expect(player1.value - player1InitialRating).toBeGreaterThan(16); // Should gain more than 16 points
    });
  });

  describe('edge cases', () => {
    it('should handle extreme rating differences correctly', () => {
      // Very low rated player (800) vs very high rated player (2000)
      const lowRated = new PlayerRating();
      lowRated.lose(1200); // Lower rating to about 1184
      lowRated.lose(1184); // Lower rating to about 1168
      lowRated.lose(1168); // Lower rating to about 1152
      lowRated.lose(1152); // Lower rating to about 1136
      lowRated.lose(1136); // Lower rating to about 1120
      lowRated.lose(1120); // Lower rating to about 1104

      const highRated = new PlayerRating();
      highRated.win(1200); // Raise rating to about 1216
      highRated.win(1216); // Raise rating to about 1232
      highRated.win(1232); // Raise rating to about 1248
      highRated.win(1248); // Raise rating to about 1264
      highRated.win(1264); // Raise rating to about 1280
      highRated.win(1280); // Raise rating to about 1296

      const lowRatedInitial = lowRated.value;
      const highRatedInitial = highRated.value;

      // When high rated player wins (expected outcome)
      highRated.win(lowRated.value);
      lowRated.lose(highRated.value);

      // High rated player should gain very little
      expect(highRated.value - highRatedInitial).toBeLessThan(10);

      // Reset for upset scenario
      const lowRated2 = new PlayerRating();
      const highRated2 = new PlayerRating();
      for (let i = 0; i < 10; i++) {
        lowRated2.lose(1200 - i * 10);
        highRated2.win(1200 + i * 10);
      }

      const lowRated2Initial = lowRated2.value;
      const highRated2Initial = highRated2.value;

      // When low rated player wins (upset)
      lowRated2.win(highRated2.value);
      highRated2.lose(lowRated2.value);

      // Low rated player should gain a lot
      expect(lowRated2.value - lowRated2Initial).toBeGreaterThan(25);
      // High rated player should lose a lot
      expect(highRated2Initial - highRated2.value).toBeGreaterThan(25);
    });

    it('should handle successive wins and losses correctly', () => {
      const player = new PlayerRating();
      const initialRating = player.value;

      // 5 consecutive wins against equal opponents
      for (let i = 0; i < 5; i++) {
        player.win(initialRating);
      }

      expect(player.value).toBeGreaterThan(initialRating + 70);

      const peakRating = player.value;

      // 5 consecutive losses against equal opponents
      for (let i = 0; i < 5; i++) {
        player.lose(initialRating);
      }

      expect(player.value).toBeLessThan(peakRating - 70);
    });
  });
});
