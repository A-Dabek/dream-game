# Project Overview

A turn-based game implementation where players use items to defeat opponents. The project follows a modular architecture with a clear separation of concerns.

## Modules

### [Item](./item)

The foundation module. Defines core data structures:

- **Items & Effects**: Atomic actions (damage, heal) and reactive passives/status effects.
- **Library**: Concrete item behaviors (blueprints).
- **Independent**: No dependencies on other modules.

### [Engine](./engine)

A synchronous, deterministic state machine built with Angular signals:

- **Responsibility**: Applies item effects and manages immutable game state snapshots.
- **Passive Effects**: Uses a strategy pattern ([Effects Submodule](./engine/effects)) to handle triggers and durations.
- **Dependency**: Depends only on the `Item` module.

### [Board](./board)

The orchestration layer on top of the Engine:

- **Turn Management**: Calculates turn distribution based on player speed.
- **Validation**: Ensures actions (Play Item, Pass, Surrender) are legal before delegating to the Engine.
- **Simulation**: Supports `clone()` for exploring future game states.

### [UI](./ui)

Angular components for displaying the game:

- **Mobile First**: Layout optimized for mobile (player at bottom, opponent at top, turn order on left).
- **Reactive**: Built with Angular signals for high performance.
- **Modular**: Independent UI components for items, hands, and turn queues.
- **Screens**: Includes a pre-game `VsScreen` and post-game `PostGameScreen` with animated slide transitions orchestrated by `GameContainerComponent`.

### [AI](./ai)

Decision-making algorithms for CPU players:

- **Strategy Pattern**: Implements various algorithms (e.g., Minimax, FirstAvailable).
- **Mechanism**: Uses `Board` simulation to evaluate potential actions.

### [Rating](./rating)

A self-contained Elo-like system to track player performance.

### [Player](./player)

Integrates identity, rating, loadout, and AI:

- **Composite Object**: Wraps modules into a cohesive `Player` entity.
- **CPU Factory**: Includes a factory for generating randomized CPU opponents with 5 items and varying base attributes.
- **Dependency**: Orchestrates `Rating`, `Item`, and `AI`.

### [Game](./game)

The high-level orchestration module:

- **Game Lifecycle**: Managed by `GameService`, handles starting a game and running the asynchronous game loop.
- **Asynchronous Flow**: Support for asynchronous player strategies (human and AI).
- **Logging**: Emits engine logs for UI animation.
- **Rating Synchronization**: Updates player ratings automatically upon game completion.
- **Orchestration**: Connects `Player` and `Board` modules.
