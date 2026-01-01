# Engine Module - Agent Documentation

## Overview

Game state management system that calculates and tracks game state after items are played. Uses Angular signals for reactive state updates without side effects.

## Core Files

- `engine.model.ts` - Type definitions
- `engine.service.ts` - Game state calculation and management
- `index.ts` - Public exports

## Key Concepts

**EngineState**: Immutable snapshot containing both players and their properties.

**Signal-Based State**: Angular signals (`signal()` and `computed()`) provide reactive state management with no side effects.

**State Transitions**: Game state updates only through three public methods: `initializeGame()`, `play()`, and `resetGame()`.

## Data Models

EngineState contains:
- `playerOne: Player`
- `playerTwo: Player`

Each Player contains `health` and `items` properties.

## API

### EngineService Methods

**initializeGame(playerOne: Player, playerTwo: Player): void**
- Sets initial game state with two players
- Called before game starts

**play(itemName: string): void**
- Processes item effect on current game state
- Calculates new EngineState based on item rules
- Updates `engineStateSignal` with new state
- Currently a placeholder; delegates to future item effect handlers

**resetGame(): void**
- Clears game state to null
- Used when game ends or resets

### Computed Signals (Read-Only)

- `engineState` - Current complete game state snapshot
- `playerOneHealth` - Player one's current health (defaults to 0 if null)
- `playerTwoHealth` - Player two's current health (defaults to 0 if null)
- `playerOneItems` - Player one's available items (defaults to empty array)
- `playerTwoItems` - Player two's available items (defaults to empty array)

## Implementation Notes

- All state updates are immutable; new EngineState objects are created rather than mutated
- Service uses pure functions with no side effects
- Computed signals derive state reactively from `engineStateSignal`
- Use `set()` for signal updates, not `mutate()`
- Item effect logic not yet implemented; will be added as external handlers
