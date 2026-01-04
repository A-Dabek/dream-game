# Engine Module - Agent Documentation

## Overview

The core game engine that manages the game state and flow. It is a synchronous and deterministic state machine built using Angular signals for reactive state updates.

## Core Files

- `engine.model.ts` - Type definitions for engine state and loadouts.
- `processors.ts` - Implementation of all effect processors.
- `engine.ts` - Core engine logic and state management.
- `index.ts` - Public exports for the engine module.

## Key Concepts

**EngineState**: An immutable snapshot of the game state, containing state for both players.

**EffectProcessors**: Pure functions that take the current state, the acting player, and a value, and return either a new `EngineState` or a list of further `ItemEffect` objects to be processed. This allows for complex effect chains and logic reuse.

**EndOfTurnEffects**: A list of effects stored within each player's state that are processed at the end of their turn. These are usually one-off effects scheduled by playing an item.

**Passive Effects**: A declarative way for items to react to game events. The engine scans all items in the loadout at initialization and stores their passive effects in a global list. Each passive effect is linked to its origin item via an `instanceId`. When an item is removed, its associated passive effects are automatically cleaned up.

**Conditions**: A layer of logic that determines when a passive effect should trigger. For example, `on_damage_taken`.

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

- `damage`: A high-level effect that resolves to `apply_damage` and `check_reactive_removal`.
- `apply_damage`: Decreases the opponent's health.
- `check_reactive_removal`: A hook that triggers reactive effects. It checks `passiveEffects` system (filtering for `on_damage_taken` condition).
- `remove_item`: Removes an item from the acting player's loadout and cleans up its passive effects.
- `remove_item_from_opponent`: Removes an item from the opponent's loadout and cleans up its passive effects.
- `healing`: Increases the acting player's health.
- `add_passive_attack`: Adds a `passive_attack` effect to the player's `endOfTurnEffects`.
- `passive_attack`: A high-level effect that resolves to an `attack` effect during processing.

## Implementation Notes

- The engine is deterministic and side-effect free.
- State updates are immutable, leveraging Angular's `signal.update()`.
- Effect processing is recursive, allowing high-level effects to resolve into low-level ones (e.g., `passive_attack` -> `attack` -> `damage`).
- The engine only depends on the `item` module.
