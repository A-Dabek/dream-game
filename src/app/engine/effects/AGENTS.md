# Engine Effects Module

This module provides an object-oriented implementation of passive effects, following a strategy pattern to handle
different trigger conditions and expiration rules.

## Core Components

### PassiveInstance

The primary interface for passive effects in the engine. It encapsulates the state and behavior of a single passive
effect.

- `DefaultPassiveInstance`: The standard implementation that delegates logic to `PassiveCondition` and
  `PassiveDuration`.

### PassiveCondition

Handles the logic for when a passive effect should react to a game event.

- `EffectCondition`: Reacts to `before_effect` or `after_effect` events (e.g., damage, healing).
- `OnPlayCondition`: Reacts when an item is played.
- `OnTurnEndCondition`: Reacts when a turn ends.
- `DefaultCondition`: A fallback condition.

### PassiveDuration

Manages the lifecycle and expiration of a passive effect.

- `PermanentDuration`: The effect never expires.
- `TurnsDuration`: The effect expires after a specific number of turns.
- `ChargesDuration`: The effect expires after a specific number of triggers (charges).

## Key Patterns

- **Delegation**: `DefaultPassiveInstance` delegates `shouldReact` and `handle` logic to `PassiveCondition`, and
  `update` (expiration) logic to `PassiveDuration`.
- **Immutability**: All classes are designed to be immutable. State updates (like decrementing turns or charges) return
  a new instance of the object.
- **Factory Functions**: `createCondition` and `createDuration` are used to instantiate concrete classes from plain data
  objects (the `Condition` and `Duration` interfaces from the `item` module).
