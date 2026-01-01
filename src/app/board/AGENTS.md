# Board Module - Agent Documentation

## Overview

Interface layer between players and the game engine. Manages game state, validates player actions, tracks action history, and coordinates turn management. Uses Angular signals for reactive state updates.

## Core Files

- `board.model.ts` - Type definitions and enums
- `board.service.ts` - Game orchestration and action handling
- `index.ts` - Public exports

## Key Concepts

**GameState**: Complete game snapshot containing both players, turn information, and game status.

**Action Validation**: All player actions (PLAY_ITEM, SURRENDER, PASS) are validated before execution. Invalid actions fail gracefully without state mutation.

**Turn Management**: Turns alternate between players automatically after successful actions. Turn order determined by player speed at game initialization.

**Action History**: Immutable record of all successful actions. Failed actions are not recorded.

**Engine Delegation**: Item effect calculations delegated to EngineService. BoardService handles validation and state transitions only.

## Data Models

GameState contains:
- `player: Player` - First player in match
- `opponent: Player` - Second player in match
- `turnInfo: TurnInfo` - Current and next player IDs plus turn queue
- `isGameOver: boolean` - Match completion status
- `winnerId?: string` - Optional winning player ID

Player contains:
- `id: string` - Unique identifier
- `name: string` - Display name
- `health: number` - Current health value
- `items: Item[]` - Available items to play
- `speed: number` - Turn order priority (higher speed = first turn)

GameActionType enum: PLAY_ITEM, SURRENDER

## API

### Initialization

**initializeGame(gameState: GameState): void**
- Sets initial game state
- Calculates turn order based on player speed (higher speed goes first)
- Resets action history
- Initializes engine with both players

### Player Actions

**playItem(itemName: string, playerId: string): GameActionResult**
- Validates item exists in player inventory
- Validates it's player's turn
- Delegates item effect to engine
- Advances turn on success
- Returns GameActionResult with success status and action details

**pass(playerId: string): GameActionResult**
- Validates it's player's turn
- Skips to next player's turn
- Returns GameActionResult

**surrender(playerId: string): GameActionResult**
- Validates player exists
- Ends game with surrendering player as loser
- Returns GameActionResult

### State Queries (Computed Signals - Read-Only)

- `gameState` - Current complete game state
- `playerHealth` - Current player health (defaults to 0 if null)
- `opponentHealth` - Opponent health (defaults to 0 if null)
- `playerItems` - Current player items (defaults to empty array)
- `opponentItems` - Opponent items (defaults to empty array)
- `currentTurn` - Current turn information
- `isGameOver` - Game completion status
- `currentPlayerId` - ID of player whose turn it is
- `nextPlayerId` - ID of next player
- `actionHistory` - All successful actions in chronological order

### Helper Methods

**getOpponentId(playerId: string): string | null**
- Returns opponent ID for given player
- Returns null if player not in current game

**isPlayersTurn(playerId: string): boolean**
- True if given player is current player

**playerHasItem(playerId: string, itemName: string): boolean**
- True if player owns item

**getPlayerHealth(playerId: string): number | null**
- Returns player's current health or null if player not found

**updateGameState(newGameState: GameState): void**
- Directly updates game state (use sparingly, prefer action methods)

**resetGame(): void**
- Clears game state and action history

## Validation Rules

Action fails if:
- Game not initialized
- Game is over
- Not player's turn (applies to PLAY_ITEM and PASS only)
- Player not found in game
- Item not found in player inventory (PLAY_ITEM only)

## Implementation Notes

- All state updates immutable; new GameState objects created
- Turn advances automatically after successful PLAY_ITEM or PASS
- Failed actions return result with error message; state unchanged
- Action history tracks successful actions only with timestamps
- Engine state synchronized via EngineService.initializeGame() and EngineService.play()
