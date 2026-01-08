# Engine Effects Module

This module provides an object-oriented implementation of reactive effects (passives and status effects), following a strategy pattern to handle different trigger conditions and expiration rules.

## Core Components

### EffectInstance

The primary interface for reactive effects in the engine. It encapsulates the state and behavior of a single effect.

- `passive/`: Contains listeners tied to an item's existence in the loadout. They are automatically cleaned up when the item is removed.
- `status/`: Contains listeners tied to a duration (buffs/debuffs). They are automatically cleaned up when their duration expires.

### ReactiveCondition

Handles the logic for when a reactive effect should react to a game event.

- `EffectCondition`: Reacts to `before_effect` or `after_effect` events (e.g., damage, healing).
- `OnPlayCondition`: Reacts when an item is played.
- `OnTurnEndCondition`: Reacts when a turn ends.

### ReactiveDuration

Manages the lifecycle and expiration of a reactive effect.

- `PermanentDuration`: The effect never expires.
- `TurnsDuration`: The effect expires after a specific number of turns.
- `ChargesDuration`: The effect expires after a specific number of triggers (charges).

## Key Patterns

- **Specialization**: Listeners are organized into `passive` and `status` subdirectories to reflect their different cleanup lifecycles.
- **Delegation**: Listener instances delegate `shouldReact` logic to `ReactiveCondition`, and `update` or expiration logic to `ReactiveDuration`.
- **Factory Functions**: `ListenerFactory`, `createCondition`, and `createDuration` are used to instantiate the correct concrete classes from data configurations.
