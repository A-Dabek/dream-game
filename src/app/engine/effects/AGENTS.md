# Engine Effects Module

This module provides an object-oriented implementation of reactive effects (passives and status effects), following a strategy pattern to handle different trigger conditions and expiration rules.

## Core Components

### EffectInstance

The primary interface for reactive effects in the engine. It encapsulates the state and behavior of a single effect.

- `passive/`: Contains listeners tied to an item's existence in the loadout. They are automatically cleaned up when the item is removed.
- `status/`: Contains listeners tied to a duration (buffs/debuffs). They are automatically cleaned up when their duration expires.

### ReactiveCondition

Handles the logic for when a reactive effect should react to a game event. It uses a functional composition approach, combining small, reusable predicates.

- `matchType(type, value?)`: Matches the event type and optionally its value. Handles `before_effect` and `after_effect` logic.
- `isEventOwner`: Matches if the event was triggered by the player.
- `isNotEventOwner`: Matches if the event was NOT triggered by the player.
- `isTargetMe`: Matches if the player is the target of the effect.
- `hasNoItems`: Matches if the player has no items in their loadout.

Logical combinators:
- `and(...predicates)`: All predicates must match.
- `or(...predicates)`: At least one predicate must match.
- `not(predicate)`: Negates the predicate.

These building blocks are assembled in `createCondition` to implement high-level triggers like `ON_PLAY`, `ON_TURN_END`, etc.

### ReactiveDuration

Manages the lifecycle and expiration of a reactive effect.

- `PermanentDuration`: The effect never expires.
- `TurnsDuration`: The effect expires after a specific number of turns.
- `ChargesDuration`: The effect expires after a specific number of triggers (charges).

## Key Patterns

- **Specialization**: Listeners are organized into `passive` and `status` subdirectories to reflect their different cleanup lifecycles.
- **Delegation**: Listener instances delegate `shouldReact` logic to `ReactiveCondition`, and `update` or expiration logic to `ReactiveDuration`.
- **Factory Functions**: `ListenerFactory`, `createCondition`, and `createDuration` are used to instantiate the correct concrete classes from data configurations.
