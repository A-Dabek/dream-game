# Game Module

Responsible for orchestrating games between players.

## Components

### [GameService](./game.service.ts)

A singleton service that manages the game lifecycle:

- **Game Loop**: Executes a synchronous loop that asks players for actions until the game is over.
- **Rating Updates**: Automatically updates player ratings (Elo-like) based on the game outcome.
- **Board Integration**: Uses the `Board` module to maintain and advance the game state.

## Usage

```typescript
const gameService = inject(GameService);
const player1 = createCpuPlayer('cpu1', 'CPU 1');
const player2 = createCpuPlayer('cpu2', 'CPU 2');

const finalBoard = gameService.startGame(player1, player2);
console.log('Winner:', finalBoard.gameState.winnerId);
```

## Dependencies

- **Board**: To manage game state and logic.
- **Player**: To interact with player entities, their ratings, and AI strategies.
- **Rating**: To update performance metrics.
- **Item**: For item identifiers in actions.
