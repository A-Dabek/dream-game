# Scoring Module Documentation

## Overview

ELO-based rating system for game matchmaking, similar to chess. Calculates rating changes based on match outcomes and player skill differences.

## Core Files

- `score.model.ts` - Type definitions
- `scoring.service.ts` - Rating calculation logic
- `scoring.service.spec.ts` - Unit tests
- `index.ts` - Public exports

## Key Concepts

**ELO Algorithm**: Awards more points to weaker players who win, fewer points to stronger players who win. K-factor = 32 (max rating change per match).

**Expected Score Formula**: `1 / (1 + 10^(opponentRating − playerRating) / 400)`

**Rating Change**: `K_FACTOR × (actualScore − expectedScore)`

## Data Models

```typescript
interface Score {
  rating: number;
  matchesPlayed: number;
}

enum MatchResult {
  WIN = 'WIN',
  LOSS = 'LOSS',
  DRAW = 'DRAW'
}
```

# Scoring Module Documentation

## Overview

ELO-based rating system for game matchmaking, similar to chess. Calculates rating changes based on match outcomes and player skill differences.

## Core Files

- `score.model.ts` - Type definitions
- `scoring.service.ts` - Rating calculation logic
- `scoring.service.spec.ts` - Unit tests
- `index.ts` - Public exports

## Key Concepts

**ELO Algorithm**: Awards more points to weaker players who win, fewer points to stronger players who win. K-factor = 32 (max rating change per match).

**Expected Score Formula**: `1 / (1 + 10^(opponentRating − playerRating) / 400)`

**Rating Change**: `K_FACTOR × (actualScore − expectedScore)`

## Data Models

```typescript
interface Score {
  rating: number;
  matchesPlayed: number;
}

enum MatchResult {
  WIN = 'WIN',
  LOSS = 'LOSS',
  DRAW = 'DRAW'
}
```

## API

ScoringService.calculateNewRating(playerScore, opponentScore, result): Score
Returns updated score with new rating and incremented match count.
* WIN → actualScore = 1.0
* LOSS → actualScore = 0.0
* DRAW → actualScore = 0.5

Note: Service does NOT enforce rating boundaries. Consumer is responsible for validation.

## Important Implementation Details

Pure functions with no side effects
Deterministic and reproducible calculations
No rounding applied (consumers may round for display)
Match count always increments by 1
