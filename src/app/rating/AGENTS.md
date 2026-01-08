# Rating Module

## Overview

The Rating Module provides an Elo-like rating system for players. It calculates and updates player ratings based on game outcomes.

## API

### `Rating` (interface)

- `value`: A read-only number representing the player's current rating
- `win(opponentRating)`: Updates rating after winning against an opponent
- `lose(opponentRating)`: Updates rating after losing to an opponent

### `PlayerRating` (class)

Implementation of the Rating interface with:

- Default starting rating of 1200
- Standard Elo K-factor of 32

## Usage Example

```typescript
import { PlayerRating } from "./rating";

// Create rating instances for players
const playerRating = new PlayerRating();
const opponentRating = new PlayerRating();

// Update ratings after a match
if (playerWins) {
  playerRating.win(opponentRating.value);
  opponentRating.lose(playerRating.value);
} else {
  playerRating.lose(opponentRating.value);
  opponentRating.win(playerRating.value);
}

// Get current ratings
console.log(`Player rating: ${playerRating.value}`);
console.log(`Opponent rating: ${opponentRating.value}`);
```

The module is self-contained and doesn't have any dependencies on other game modules.
