# Player Module

This module is responsible for managing player entities in the game. A player is a composite object that brings together several core game systems.

## Responsibilities

- **Player Definition**: Defines the `Player` interface, which combines a player's identity, rating, loadout, and AI strategy.
- **CPU Player Factory**: Provides a factory method to create randomized CPU players for gameplay.
- **Builder Pattern**: Implements `CpuPlayerBuilder` to allow flexible configuration of CPU players.

## Core Components

### Player Interface

The `Player` interface includes:

- `id`: Unique identifier.
- `name`: Display name.
- `rating`: An instance of `Rating` (from the `rating` module) to track skill level.
- `loadout`: An instance of `Loadout` (from the `item` module) containing items and base attributes (health, speed).
- `strategy`: An instance of `Strategy` (from the `ai` module) to handle decision-making.

### Factory: `createCpuPlayer(id: string, name: string)`

Creates a new `Player` object with default configuration:

- Initial `PlayerRating` (1200).
- `FirstAvailableStrategy` for decision making.
- A randomized `Loadout` consisting of:
  - 5 random items from the available item library.
  - Randomized `health` (10-15).
  - Randomized `speed` (5-10).

### Builder: `CpuPlayerBuilder`

Provides a fluent interface for creating CPU players with custom configurations.

#### Methods

- `withRandomHealth(min: number, max: number)`: Sets health to a random value between min and max (inclusive).
- `withRandomSpeed(min: number, max: number)`: Sets speed to a random value between min and max (inclusive).
- `withRandomItems(count: number)`: Configures the loadout with `count` random items.
- `withLeftMostStrategy()`: Sets the strategy to `FirstAvailableStrategy`.
- `build()`: Builds and returns the configured `Player` object.

#### Usage

```typescript
import { CpuPlayerBuilder } from "./player";

const player = new CpuPlayerBuilder("cpu-1", "Strong Bot").withRandomHealth(100, 150).withRandomSpeed(8, 12).withRandomItems(5).withLeftMostStrategy().build();

console.log(player.loadout.health); // e.g., 125
console.log(player.loadout.speed); // e.g., 10
console.log(player.loadout.items.length); // 5
```

The builder uses a fluent interface, allowing methods to be called in any order. Configuration can be overridden by calling methods multiple times—the last call wins.
