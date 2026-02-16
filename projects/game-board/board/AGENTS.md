# Board Module - Agent Documentation

## Overview

Interface layer between players and the game engine. Manages game state, validates player actions, tracks action
history, and coordinates turn management. The core logic is encapsulated in the `Board` class.

## Core Files

- `board.model.ts` - Type definitions and enums
- `board.ts` - Core game logic and state management
- `test/` - Integration and unit tests for board behavior
- `test/test-utils.ts` - Shared utilities for creating mock players in tests
- `index.ts` - Public export

## Key Concepts

**GameState**: Complete game snapshot containing both players, turn information, and game status. The turn queue
is now a list of `TurnEntry`s coming directly from the engine's `TurnManager`, so each entry carries both the
`playerId` and a stable animation-friendly `id`.

**Action Validation**: All player actions (PLAY_ITEM, SURRENDER, PASS) are validated before execution. Invalid actions
throw an error without state mutation.

**Turn Management**: Turns are distributed continuously based on player speed using the TurnManager Bresenham-like
algorithm. Every active `turnInfo.turnQueue` entry is supplied by the engine/TurnManager and includes a stable `id`
so the UI can track animations while still displaying the correct `playerId`.

**Action History**: record of all successful actions. Failed actions are not recorded.

**Engine Delegation**: Item effect calculations delegated to Engine. Board handles validation and state transitions.

**State Synchronization**: `Board.syncWithEngine()` synchronizes player state from the Engine after each action, including:

- `health` - Current health value
- `items` - Remaining inventory
- `speed` - Current speed (affected by items like wingfoot/sticky_boot)
- Turn queue and game over status

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

GameActionType enum: PLAY_ITEM, SURRENDER, PASS

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
- Triggers end-of-turn effects via engine
- Removes item from player's inventory (one-time use)
- Advances turn on success
- Mutates the board state and returns GameActionResult

**pass(playerId: string): GameActionResult**

- Validates it's player's turn
- Triggers end-of-turn effects via engine
- Skips to next player's turn based on speed distribution
- Mutates the board state and returns GameActionResult

**surrender(playerId: string): GameActionResult**

- Validates player exists
- Ends game with surrendering player as loser
- Mutates the board state and returns GameActionResult

**consumeLog(): LogEntry[]**

- Returns and depletes engine logs. Should be called after every action that might generate logs.

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
- End-of-turn effects are processed at the end of each turn (after playing an item or passing).
- Items are one-time use and are removed from player inventory after a successful PLAY_ITEM action.
- Turn distribution is continuous and based on player speeds.
- Invalid actions throw an error; state unchanged.
- Action history tracks successful actions only with timestamps.
- Simulation is supported via the `clone()` method.
- Faster player starts the turn by default when no explicit starting player is provided.

## Testing

Use `createMockPlayer` from `test/test-utils.ts` to create player loadouts for tests.
When testing item effects, give the acting player a higher speed to ensure they start the turn.
Integration tests (using `Board`) should focus on game state outcomes (health, inventory, turns) and logs, and should not assert on internal engine details like `listeners`.
