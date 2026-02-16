# Player Module

This module is responsible for managing player entities in the game. A player is a composite object that brings together several core game systems.

## Responsibilities

- **Player Definition**: Defines the `Player` interface, which combines a player's identity, rating, loadout, and AI strategy.
- **CPU Player Factory**: Provides factory methods to create CPU players with default or custom configurations.
- **Builder Pattern**: Implements `CpuPlayerBuilder` to allow flexible configuration of CPU players.
- **Configuration API**: Exports `PlayerConfig` and `GamePlayersConfig` types for structured player creation.

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

### Factory: `createCpuPlayerWithConfig(id: string, name: string, config: PlayerConfig)`

Creates a `Player` with custom configuration. Invalid values gracefully fall back to defaults.

#### Parameters

- `id`: Unique identifier for the player.
- `name`: Display name for the player.
- `config`: `PlayerConfig` object with optional properties:
  - `items`: Array of `ItemId` values for the player's loadout. Invalid IDs are filtered out.
  - `health`: Exact health value. Falls back to default range if not positive.
  - `speed`: Exact speed value. Falls back to default range if not positive.

#### Usage

```typescript
import { createCpuPlayerWithConfig } from '@dream/player';
import { ItemId } from '@dream/item';

const player = createCpuPlayerWithConfig('cpu-1', 'Test Bot', {
  items: ['punch', 'sticking_plaster', 'wingfoot'] as ItemId[],
  health: 25,
  speed: 8,
});

console.log(player.loadout.items.length); // 3
console.log(player.loadout.health); // 25
console.log(player.loadout.speed); // 8
```

### Factory: `createGamePlayers(config: GamePlayersConfig)`

Convenience factory that creates both players for a game from a single configuration object.

#### Parameters

- `config`: `GamePlayersConfig` object with optional properties:
  - `player1`: `PlayerConfig` for player 1. Uses defaults if undefined.
  - `player2`: `PlayerConfig` for player 2. Uses defaults if undefined.

#### Returns

Object containing `player1` and `player2` `Player` instances.

#### Usage

```typescript
import { createGamePlayers } from '@dream/player';
import { ItemId } from '@dream/item';

const { player1, player2 } = createGamePlayers({
  player1: {
    items: ['punch', 'wingfoot'] as ItemId[],
    health: 20,
    speed: 10,
  },
  player2: {
    items: ['sticky_boot'] as ItemId[],
    health: 15,
    speed: 5,
  },
});

// Partial configuration - only player1 is customized
const { player1, player2 } = createGamePlayers({
  player1: {
    items: ['punch'] as ItemId[],
    health: 30,
  },
});
// player2 uses default random values

// No configuration - both use defaults
const { player1, player2 } = createGamePlayers();
```

### Configuration Types

#### `PlayerConfig`

```typescript
interface PlayerConfig {
  items?: ItemId[]; // Array of ItemId values. Invalid IDs filtered out.
  health?: number; // Health value. Falls back if not positive.
  speed?: number; // Speed value. Falls back if not positive.
}
```

#### `GamePlayersConfig`

```typescript
interface GamePlayersConfig {
  player1?: PlayerConfig; // Configuration for player 1
  player2?: PlayerConfig; // Configuration for player 2
}
```

### Builder: `CpuPlayerBuilder`

Provides a fluent interface for creating CPU players with custom configurations. Supports both random ranges and exact values.

#### Random Value Methods

- `withRandomHealth(min: number, max: number)`: Sets health to a random value between min and max (inclusive).
- `withRandomSpeed(min: number, max: number)`: Sets speed to a random value between min and max (inclusive).
- `withRandomItems(count: number)`: Configures the loadout with `count` random items.

#### Exact Value Methods

- `withHealth(health: number)`: Sets exact health value. Invalid values fall back to random.
- `withSpeed(speed: number)`: Sets exact speed value. Invalid values fall back to random.
- `withItems(itemIds: ItemId[])`: Sets exact items by ItemId. Invalid IDs are filtered out.
- `withConfig(config: PlayerConfig)`: Applies a `PlayerConfig` object to the builder.

#### Strategy Methods

- `withLeftMostStrategy()`: Sets the strategy to `FirstAvailableStrategy`.

#### Build Method

- `build()`: Builds and returns the configured `Player` object.

#### Usage

```typescript
import { CpuPlayerBuilder } from '@dream/player';

// Random configuration
const randomPlayer = new CpuPlayerBuilder('cpu-1', 'Strong Bot').withRandomHealth(100, 150).withRandomSpeed(8, 12).withRandomItems(5).withLeftMostStrategy().build();

// Exact configuration
import { ItemId } from '@dream/item';
const exactPlayer = new CpuPlayerBuilder('cpu-2', 'Precise Bot')
  .withItems(['punch', 'sticking_plaster'] as ItemId[])
  .withHealth(25)
  .withSpeed(8)
  .withLeftMostStrategy()
  .build();

// Using config object
const configPlayer = new CpuPlayerBuilder('cpu-3', 'Config Bot')
  .withConfig({
    items: ['wingfoot'] as ItemId[],
    health: 30,
    speed: 12,
  })
  .withLeftMostStrategy()
  .build();
```

The builder uses a fluent interface, allowing methods to be called in any order. Configuration can be overridden by calling methods multiple times—the last call wins.

## Error Handling and Fallback Behavior

The configuration API is designed to gracefully handle invalid inputs:

- **Invalid ItemIds**: Filtered out during item generation. Empty array results in no items.
- **Non-positive health**: Falls back to random value in default range (10-15).
- **Non-positive speed**: Falls back to random value in default range (5-10).
- **Missing configuration**: Uses default randomized values.
- **Partial configuration**: Only specified values are customized; others use defaults.
