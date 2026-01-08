# Player Module

This module is responsible for managing player entities in the game. A player is a composite object that brings together several core game systems.

## Responsibilities

- **Player Definition**: Defines the `Player` interface, which combines a player's identity, rating, loadout, and AI strategy.
- **CPU Player Factory**: Provides a factory method to create randomized CPU players for gameplay.

## Core Components

### Player Interface

The `Player` interface includes:
- `id`: Unique identifier.
- `name`: Display name.
- `rating`: An instance of `Rating` (from the `rating` module) to track skill level.
- `loadout`: An instance of `Loadout` (from the `item` module) containing items and base attributes (health, speed).
- `strategy`: An instance of `Strategy` (from the `ai` module) to handle decision-making.

### Factory: `createCpuPlayer(id: string, name: string)`

Creates a new `Player` object with:
- Initial `PlayerRating` (1200).
- `FirstAvailableStrategy` for decision making.
- A randomized `Loadout` consisting of:
  - 5 random items from the available item library.
  - Randomized `health` (100-150).
  - Randomized `speed` (5-10).

## Usage

```typescript
import { createCpuPlayer } from './player';

const cpuPlayer = createCpuPlayer('cpu-1', 'Basic Bot');
console.log(cpuPlayer.loadout.health); // e.g., 124
console.log(cpuPlayer.loadout.items.length); // 5
```
