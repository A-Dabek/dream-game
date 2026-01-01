import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { GameService } from './game.service';
import { BoardService, Player } from '../board';
import { EngineService } from '../engine';
import { ScoringService } from '../scoring';
import { GameConfig, PlayerIntelligence } from './game.model';
import { MatchResult, Score } from '../scoring';

describe('GameService', () => {
  let gameService: GameService;
  let boardServiceMock: {
    initializeGame: Mock;
    isGameOver: Mock;
    currentPlayerId: Mock;
    gameState: Mock;
    resetGame: Mock;
  };
  let engineServiceMock: {
    initializeGame: Mock;
    resetGame: Mock;
  };
  let scoringServiceMock: {
    calculateNewRating: Mock;
  };

  beforeEach(() => {
    boardServiceMock = {
      initializeGame: vi.fn(),
      isGameOver: vi.fn(),
      currentPlayerId: vi.fn(),
      gameState: vi.fn(),
      resetGame: vi.fn()
    };

    engineServiceMock = {
      initializeGame: vi.fn(),
      resetGame: vi.fn()
    };

    scoringServiceMock = {
      calculateNewRating: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        GameService,
        { provide: BoardService, useValue: boardServiceMock },
        { provide: EngineService, useValue: engineServiceMock },
        { provide: ScoringService, useValue: scoringServiceMock }
      ]
    });

    gameService = TestBed.inject(GameService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('runGame', () => {
    it('should initialize game with both players', async () => {
      // Arrange
      const player1: Player = { id: 'player1', name: 'Player 1', health: 100, speed: 10 };
      const player2: Player = { id: 'player2', name: 'Player 2', health: 100, speed: 8 };

      const player1Intelligence: PlayerIntelligence = {
        player: player1,
        score: { rating: 1500, gamesPlayed: 10 },
        makeDecision: vi.fn().mockResolvedValue(undefined)
      };

      const player2Intelligence: PlayerIntelligence = {
        player: player2,
        score: { rating: 1600, gamesPlayed: 15 },
        makeDecision: vi.fn().mockResolvedValue(undefined)
      };

      const gameConfig: GameConfig = {
        playerOne: player1Intelligence,
        playerTwo: player2Intelligence
      };

      // End the game immediately
      boardServiceMock.isGameOver.mockReturnValue(true);
      boardServiceMock.gameState.mockReturnValue({
        winnerId: 'player1'
      });

      // Mock scoring calculations
      const updatedScore1: Score = { rating: 1515, gamesPlayed: 11 };
      const updatedScore2: Score = { rating: 1585, gamesPlayed: 16 };

      scoringServiceMock.calculateNewRating
        .mockReturnValueOnce(updatedScore1)
        .mockReturnValueOnce(updatedScore2);

      // Act
      const result = await gameService.runGame(gameConfig);

      // Assert
      expect(boardServiceMock.initializeGame).toHaveBeenCalledTimes(1);
      expect(engineServiceMock.initializeGame).toHaveBeenCalledWith(player1, player2);
      expect(boardServiceMock.resetGame).toHaveBeenCalledTimes(1);
      expect(engineServiceMock.resetGame).toHaveBeenCalledTimes(1);

      // Verify scoring was calculated correctly
      expect(scoringServiceMock.calculateNewRating).toHaveBeenCalledTimes(2);
      expect(scoringServiceMock.calculateNewRating).toHaveBeenNthCalledWith(
        1,
        { rating: 1500, gamesPlayed: 10 },
        { rating: 1600, gamesPlayed: 15 },
        MatchResult.WIN
      );

      expect(scoringServiceMock.calculateNewRating).toHaveBeenNthCalledWith(
        2,
        { rating: 1600, gamesPlayed: 15 },
        { rating: 1500, gamesPlayed: 10 },
        MatchResult.LOSS
      );

      // Verify result structure
      expect(result).toEqual({
        playerOne: {
          ...player1Intelligence,
          score: updatedScore1
        },
        playerTwo: {
          ...player2Intelligence,
          score: updatedScore2
        },
        winnerId: 'player1',
        outcome: MatchResult.WIN
      });
    });

    it('should run game loop until game is over', async () => {
      // Arrange
      const player1: Player = { id: 'player1', name: 'Player 1', health: 100, speed: 10 };
      const player2: Player = { id: 'player2', name: 'Player 2', health: 100, speed: 8 };

      const player1Intelligence: PlayerIntelligence = {
        player: player1,
        score: { rating: 1500, gamesPlayed: 10 },
        makeDecision: vi.fn().mockResolvedValue(undefined)
      };

      const player2Intelligence: PlayerIntelligence = {
        player: player2,
        score: { rating: 1600, gamesPlayed: 15 },
        makeDecision: vi.fn().mockResolvedValue(undefined)
      };

      const gameConfig: GameConfig = {
        playerOne: player1Intelligence,
        playerTwo: player2Intelligence
      };

      // Simulate 3 turns before game over
      boardServiceMock.isGameOver
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValue(true);

      // Alternate player turns
      boardServiceMock.currentPlayerId
        .mockReturnValueOnce('player1')
        .mockReturnValueOnce('player2')
        .mockReturnValue('player1');

      // Final game state
      boardServiceMock.gameState.mockReturnValue({
        winnerId: 'player2'
      });

      // Mock scoring calculations
      scoringServiceMock.calculateNewRating
        .mockReturnValueOnce({ rating: 1485, gamesPlayed: 11 })
        .mockReturnValueOnce({ rating: 1615, gamesPlayed: 16 });

      // Act
      await gameService.runGame(gameConfig);

      // Assert
      expect(boardServiceMock.isGameOver).toHaveBeenCalledTimes(4);
      expect(boardServiceMock.currentPlayerId).toHaveBeenCalledTimes(3);

      // Check player decision making was called correctly
      expect(player1Intelligence.makeDecision).toHaveBeenCalledTimes(2);
      expect(player2Intelligence.makeDecision).toHaveBeenCalledTimes(1);

      // Verify each player got the board service to make decisions with
      expect(player1Intelligence.makeDecision).toHaveBeenCalledWith(boardServiceMock);
      expect(player2Intelligence.makeDecision).toHaveBeenCalledWith(boardServiceMock);
    });

    it('should handle draw games correctly', async () => {
      // Arrange
      const player1: Player = { id: 'player1', name: 'Player 1', health: 100, speed: 10 };
      const player2: Player = { id: 'player2', name: 'Player 2', health: 100, speed: 8 };

      const player1Intelligence: PlayerIntelligence = {
        player: player1,
        score: { rating: 1500, gamesPlayed: 10 },
        makeDecision: vi.fn().mockResolvedValue(undefined)
      };

      const player2Intelligence: PlayerIntelligence = {
        player: player2,
        score: { rating: 1600, gamesPlayed: 15 },
        makeDecision: vi.fn().mockResolvedValue(undefined)
      };

      const gameConfig: GameConfig = {
        playerOne: player1Intelligence,
        playerTwo: player2Intelligence
      };

      // End the game immediately with a draw
      boardServiceMock.isGameOver.mockReturnValue(true);
      boardServiceMock.gameState.mockReturnValue({
        winnerId: null // null indicates a draw
      });

      // Mock scoring calculations for draw
      const updatedScore1: Score = { rating: 1505, gamesPlayed: 11 };
      const updatedScore2: Score = { rating: 1595, gamesPlayed: 16 };

      scoringServiceMock.calculateNewRating
        .mockReturnValueOnce(updatedScore1)
        .mockReturnValueOnce(updatedScore2);

      // Act
      const result = await gameService.runGame(gameConfig);

      // Assert
      expect(result.winnerId).toBeNull();
      expect(result.outcome).toBe(MatchResult.DRAW);

      // Verify scoring was called with DRAW for both players
      expect(scoringServiceMock.calculateNewRating).toHaveBeenNthCalledWith(
        1,
        player1Intelligence.score,
        player2Intelligence.score,
        MatchResult.DRAW
      );

      expect(scoringServiceMock.calculateNewRating).toHaveBeenNthCalledWith(
        2,
        player2Intelligence.score,
        player1Intelligence.score,
        MatchResult.DRAW
      );

      // Check scores were updated
      expect(result.playerOne.score).toEqual(updatedScore1);
      expect(result.playerTwo.score).toEqual(updatedScore2);
    });
  });
});
