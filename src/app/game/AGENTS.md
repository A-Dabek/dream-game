# Game Module - Agent Documentation

## Overview

Game orchestration system that uses a visitor pattern to enable player intelligence to interact with the game board. Manages game flow, player turns, and score updates in an asynchronous environment.

## Core Files

- `game.model.ts` - Type definitions for game module
- `game.service.ts` - Game loop and orchestration
- `index.ts` - Public exports

## Key Concepts

**Visitor Pattern**: PlayerIntelligence instances encapsulate both player data and decision-making logic. They visit the BoardService to make decisions, directly calling board methods.

**Async Game Loop**: GameService runs an asynchronous loop that manages turn flow, allowing each PlayerIntelligence to interact with the board until the game is complete.

**Score Updates**: Post-game, the GameService uses ScoringService to update player ratings based on the game outcome determined by the final board state.

## Data Models

**PlayerIntelligence**:
- `player: Player` - The player data
- `score: Score` - The player's current score/rating
- `makeDecision(board: BoardService): Promise<void>` - Decision method that accepts the board visitor

**GameConfig**:
- `playerOne: PlayerIntelligence`
- `playerTwo: PlayerIntelligence`

**GameResult**:
- `playerOne: PlayerIntelligence`
- `playerTwo: PlayerIntelligence` 
- `winnerId: string | null` - ID of winning player or null for draw
- `outcome: MatchResult` - Game outcome from playerOne's perspective

## API

### GameService

**runGame(config: GameConfig): Promise<GameResult>**
- Initializes board with players from config
- Runs async game loop until board.isGameOver() is true
- For each turn, calls currentPlayer's makeDecision(board)
- After game over, updates scores using ScoringService
- Returns GameResult with final state and updated scores

## Implementation Notes

- **No Health Checks in Game Loop**: The game loop does not need to check player health; it relies on the board service to determine when the game is over.
- **Direct Board Interaction**: PlayerIntelligence instances call board methods directly (playItem, pass, surrender) rather than returning decisions to GameService.
- **Winner Determination**: The board service is responsible for setting winnerId and isGameOver to true when a player surrenders or when a player's health reaches zero.
- **Score Updates**: ScoringService.calculateNewRating is called for both players based on the winnerId in the final board state.

## Integration with Other Modules

- **BoardService**: Provides game state management, action validation, and turn handling
- **EngineService**: Processes item effects and calculates health changes
- **ScoringService**: Updates player ratings based on match outcomes