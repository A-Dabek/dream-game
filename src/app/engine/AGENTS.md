# Engine Module - Agent Documentation

## Overview

The core game engine that manages the game state and flow. It is a synchronous and deterministic state machine built using Angular signals for reactive state updates.

## Core Files

- `engine.model.ts` - Type definitions for engine state and loadouts.
- `effects/` - Object-oriented implementation of passive effects (conditions, durations, instances).
- `processors.ts` - Implementation of all effect processors.
- `engine.ts` - Core engine logic and state management.
- `index.ts` - Public exports for the engine module.

## Key Concepts

**EngineState**: An immutable snapshot of the game state, containing state for both players.

**EffectProcessors**: Pure functions that take the current state, the acting player, and a value, and return either a new `EngineState` or a list of further atomic `Effect` objects to be processed.

**Lifecycle & Passive Effects**: The engine processes effects through a defined lifecycle: `on_play`, `before_effect`, `apply_effect`, `after_effect`, and `on_turn_end`. Passive effects are managed as `PassiveInstance` objects that delegate their core logic to specialized `PassiveCondition` and `PassiveDuration` objects.

**Conditions & Durations**: Logic encapsulated within `PassiveCondition` and `PassiveDuration` implementations. `PassiveCondition` handles the "when" (e.g., `OnPlayCondition`, `EffectCondition`), while `PassiveDuration` handles the "how long" (e.g., `TurnsDuration`, `ChargesDuration`, `PermanentDuration`).

## API (`Engine` Class)

### Initialization

**new Engine(playerOne: Loadout & { id: string }, playerTwo: Loadout & { id: string })**

- Initializes the engine with two player loadouts.
- Sets initial `endOfTurnEffects` to an empty array for both players.

### Actions

**play(playerId: string, itemId: ItemId): void**

- Retrieves the behavior for the given item.
- Removes the item from the player's inventory (one-time use).
- Processes all effects returned by the item's behavior.
- Updates the engine state reactively.

**processEndOfTurn(playerId: string): void**

- Processes all effects in the given player's `endOfTurnEffects` list.
- Updates the engine state reactively.

### State Queries

- `state` - A computed signal returning the current `EngineState`.

## Supported Effects

- `damage`: A high-level effect that resolves to `apply_damage`.
- `apply_damage`: Decreases the opponent's health.
- `self_damage`: A high-level effect that resolves to `apply_self_damage`.
- `apply_self_damage`: Decreases the acting player's health.
- `remove_item`: Removes an item from the acting player's loadout and cleans up its passive effects.
- `remove_item_from_opponent`: Removes an item from the opponent's loadout and cleans up its passive effects.
- `healing`: Increases the acting player's health.
- `add_passive_effect`: Adds a persistent passive effect (with its defined `Duration`).
- `decrement_passive_turns`: Decrements turns for all passive effects of a player and removes expired ones.
- `add_passive_attack`: Adds a `passive_attack` effect to the player's `endOfTurnEffects`.
- `passive_attack`: A high-level effect that resolves to an `attack` effect during processing.

## Implementation Notes

- The engine is deterministic and side-effect free.
- State updates are immutable, leveraging Angular's `signal.update()`.
- Effect processing is recursive, allowing high-level effects to resolve into low-level ones (e.g., `passive_attack` -> `attack` -> `damage`).
- The engine only depends on the `item` module.
