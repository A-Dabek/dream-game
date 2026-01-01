import { inject, Injectable, signal } from '@angular/core';
import { BoardService } from '../board';
import { EngineService } from '../engine';
import { MatchResult, ScoringService } from '../scoring';
import { GameConfig, GameResult, PlayerIntelligence } from './game.model';

/**
 * Determines match result for a player based on the winner ID
 */
function determineMatchResult(playerId: string, winnerId: string | null): MatchResult {
  if (winnerId === null) {
    return MatchResult.DRAW;
  }

  return playerId === winnerId ? MatchResult.WIN : MatchResult.LOSS;
}

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly boardService = inject(BoardService);
  private readonly engineService = inject(EngineService);
  private readonly scoringService = inject(ScoringService);

  private readonly gameInProgressSignal = signal(false);

  /**
   * Runs a game between two player intelligences
   */
  async runGame(config: GameConfig): Promise<GameResult> {
    // Initialize the board with players from PlayerIntelligence instances
    this.boardService.initializeGame({
      player: config.playerOne.player,
      opponent: config.playerTwo.player,
      turnInfo: {
        currentPlayerId: '',  // Will be determined by speed
        nextPlayerId: '',     // Will be determined by speed
        turnQueue: []         // Will be populated based on player speed
      },
      isGameOver: false
    });

    // Initialize engine with both players
    this.engineService.initializeGame(
      config.playerOne.player,
      config.playerTwo.player
    );

    this.gameInProgressSignal.set(true);

    // Map player IDs to PlayerIntelligence objects for easier lookup
    const playerMap = new Map<string, PlayerIntelligence>([
      [config.playerOne.player.id, config.playerOne],
      [config.playerTwo.player.id, config.playerTwo]
    ]);

    // Game loop - continue until game is over
    while (!this.boardService.isGameOver()) {
      // Get current player ID from board
      const currentPlayerId = this.boardService.currentPlayerId();

      // Get the PlayerIntelligence for current player
      const currentIntelligence = playerMap.get(currentPlayerId);

      if (currentIntelligence) {
        // Let the current player make a decision
        await currentIntelligence.makeDecision(this.boardService);
      }
    }

    this.gameInProgressSignal.set(false);

    // Game is over, prepare result
    const gameState = this.boardService.gameState();
    const winnerId = gameState.winnerId;

    // Determine match result for each player
    const playerOneResult = determineMatchResult(config.playerOne.player.id, winnerId);
    const playerTwoResult = determineMatchResult(config.playerTwo.player.id, winnerId);

    // Update player scores
    const updatedPlayerOneScore = this.scoringService.calculateNewRating(
      config.playerOne.score,
      config.playerTwo.score,
      playerOneResult
    );

    const updatedPlayerTwoScore = this.scoringService.calculateNewRating(
      config.playerTwo.score,
      config.playerOne.score,
      playerTwoResult
    );

    // Update scores in player intelligence objects
    config.playerOne.score = updatedPlayerOneScore;
    config.playerTwo.score = updatedPlayerTwoScore;

    // Reset game state in services
    this.boardService.resetGame();
    this.engineService.resetGame();

    return {
      playerOne: config.playerOne,
      playerTwo: config.playerTwo,
      winnerId,
      outcome: playerOneResult // Return from player one's perspective
    };
  }
}
