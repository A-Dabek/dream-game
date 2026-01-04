# Board Module - Agent Documentation

## Overview

Interface layer between players and the game engine. Manages game state, validates player actions, tracks action
history, and coordinates turn management. The core logic is encapsulated in the `Board` class.

## Core Files

- `board.model.ts` - Type definitions and enums
- `board.ts` - Core game logic and state management
- `turn-manager.ts` - Infinite turn sequence generator based on player speed
- `test/` - Integration and unit tests for board behavior
- `index.ts` - Public export

## Key Concepts

**GameState**: Complete game snapshot containing both players, turn information, and game status.

**Action Validation**: All player actions (PLAY_ITEM, SURRENDER, PASS) are validated before execution. Invalid actions
throw an error without state mutation.

**Turn Management**: Turns are distributed continuously based on player speed (Bresenham-like algorithm). Speed 13 vs 16
means 13 turns out of 29 for player 1, distributed as equally as possible.

**Action History**: record of all successful actions. Failed actions are not recorded.

**Engine Delegation**: Item effect calculations delegated to Engine. Board handles validation and state transitions.

## Data Models

GameState contains:

- `player: BoardLoadout` - First player in match
- `opponent: BoardLoadout` - Second player in match
- `turnInfo: TurnInfo` - Current and next player IDs
- `isGameOver: boolean` - Match completion status
- `winnerId?: string` - Optional winning player ID
- `actionHistory: GameAction[]` - record of all successful actions. Failed actions are not recorded.

Player contains:

- `id: string` - Unique identifier
- `health: number` - Current health value
- `items: Item[]` - Available items to play
- `speed: number` - Turn order priority (higher speed = more frequent turns)

GameActionType enum: PLAY_ITEM, SURRENDER

## API (`Board` Class)

### Initialization

**new Board(player: BoardLoadout, opponent: BoardLoadout)**

- Initializes with two player loadouts.
- Automatically calculates initial turn order based on player speeds.
- Continuous turn order logic based on player speed.
- Starts with empty action history within the game state.

### Player Actions

**playItem(itemId: ItemId, playerId: string): GameActionResult**

- Validates item exists in player inventory
- Validates it's player's turn
- Delegates item effect to engine
- Advances turn on success
- Mutates the board state and returns GameActionResult

**pass(playerId: string): GameActionResult**

- Validates it's player's turn
- Skips to next player's turn based on speed distribution
- Mutates the board state and returns GameActionResult

**surrender(playerId: string): GameActionResult**

- Validates player exists
- Ends game with surrendering player as loser
- Mutates the board state and returns GameActionResult

### State Queries (Properties/Getters)

- `gameState` - Current complete game state snapshot (includes player stats, turn info, and action history)
- `isGameOver` - Game completion status
- `playerHealth` - Current player health
- `opponentHealth` - Opponent health
- `currentPlayerId` - ID of player whose turn it is
- `nextPlayerId` - ID of next player

### Simulation

**clone(): Board**

- Returns a deep clone of the current `Board` instance.
- Use `clone.playItem()`, `clone.pass()`, or `clone.surrender()` to explore future scenarios without affecting the
  original board.

## API (`TurnManager` Class)

Responsible for calculating and managing the turn order. Uses a Bresenham-like algorithm for equal distribution based on
player speed.

- `getNextTurns(count: number): string[]` - Returns next X turns without advancing.
- `nextTurns` - Getter returning next 10 turns.
- `advanceTurn(): void` - Consumes current turn.
- `refresh(playerOneSpeed: number, playerTwoSpeed: number, firstPlayerId: string): void` - Resets distribution with new
  speeds and starting player.
- `clone(): TurnManager` - Creates a deep copy of the manager, preserving sequence state.

### Helper Methods

**getOpponentId(playerId: string): string | null**

- Returns opponent ID for given player
- Returns null if player not in current game

**isPlayersTurn(playerId: string): boolean**

- True if given player is current player

**playerHasItem(playerId: string, itemId: ItemId): boolean**

- True if player owns item

**getPlayerHealth(playerId: string): number | null**

- Returns player's current health or null if player not found

## Validation Rules

Action throws an error if:

- Game is over
- Not player's turn (applies to PLAY_ITEM and PASS only)
- Player not found in game
- Item not found in player inventory (PLAY_ITEM only)

## Implementation Notes

- `Board` is a plain class that maintains its own state.
- `Board` creates a single `Engine` instance in its constructor and maintains it throughout its life.
- Turn advances automatically after successful PLAY_ITEM or PASS.
- Turn distribution is continuous and based on player speeds.
- Invalid actions throw an error; state unchanged.
- Action history tracks successful actions only with timestamps.
- Simulation is supported via the `clone()` method.
