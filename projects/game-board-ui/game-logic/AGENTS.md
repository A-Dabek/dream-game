# Game Module

Responsible for orchestrating games between players.

## Components

### [GameService](impl/game.service.ts)

A singleton service that manages the game lifecycle:

- **Game Loop**: Executes an asynchronous loop that asks players for actions until the game is over. Supports both synchronous AI and asynchronous human strategies.
- **State Management**: Exposes the current game state via the `gameState` signal.
- **Logging**: Provides a `logs$` stream (Observable) of `LogEntry[]` for UI animations and event tracking.
- **Rating Updates**: Automatically updates player ratings (Elo-like) based on the game outcome.
- **Board Integration**: Uses the `Board` module to maintain and advance the game state.

## Usage

```typescript
const gameService = inject(GameService);
const player1 = { ...humanPlayer, strategy: new HumanStrategy() }; // HumanStrategy from UI module
const player2 = createCpuPlayer('cpu', 'CPU');

// Starts the async loop
gameService.startGame(player1, player2);
```

## Dependencies

- **Board**: To manage game state and logic.
- **Player**: To interact with player entities, their ratings, and AI strategies.
- **Rating**: To update performance metrics.
- **Item**: For item identifiers in actions.
