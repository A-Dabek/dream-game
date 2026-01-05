# Project Overview

A turn-based game implementation where players use items to defeat opponents. The project follows a modular architecture with a clear separation of concerns.

## Modules

### [Item](./item)

The foundation module. Defines core data structures:

- **Items & Effects**: Atomic actions (damage, heal) and reactive passives.
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

### [AI](./ai)

Decision-making algorithms for CPU players:

- **Strategy Pattern**: Implements various algorithms (e.g., Minimax, FirstAvailable).
- **Mechanism**: Uses `Board` simulation to evaluate potential actions.

### [Rating](./rating)

A self-contained Elo-like system to track player performance.
