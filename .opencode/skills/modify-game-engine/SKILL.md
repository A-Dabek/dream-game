---
name: modify-game-engine
description: Use this skill when you need to modify or extend the game engine processing logic
---

# Game Engine Architecture

The game engine uses an **event-driven pipeline architecture** with three main stages. Understanding this flow is essential for making modifications.

## Architecture Overview

```
Item Played
    ↓
[Stage 1: Event Generation] → Creates GameEvent (Status: NEW)
    ↓
[Stage 2: Listener Chain] → Multiple passes through listeners (Status: PROGRESS → DONE)
    ↓
[Stage 3: Effect Processing] → StateManager applies atomic effects to state (at Status: PROGRESS)
    ↓
State Updated
```

Read these files to understand the complete flow:
- `projects/game-board/engine/engine.ts` - Main engine orchestration
- `projects/game-board/engine/events-processor.ts` - Event loop logic
- `projects/game-board/engine/state-manager.ts` - State management and atomic mutations
- `projects/game-board/engine/effects/listener-factory.ts` - Listener creation
- `projects/game-board/engine/effects/instances/base-effect-instance.ts` - Base listener logic

## Stage 1: Event Generation

**Where:** `projects/game-board/engine/engine.ts:#play`

When an item is played:
1. Item behavior is retrieved via `getItemBehavior(itemId)`
2. `on_play` event is created and processed through listeners
3. Effects from `whenPlayed()` are gathered
4. Each effect becomes a `GameEvent` of type `'effect'`

**Key Pattern:** Events flow through the system - they are never applied directly to state.

## Stage 2: Listener Chain (The Heart of the Engine)

**Where:** `projects/game-board/engine/events-processor.ts:#runEventLoop`

The engine uses a **multi-pass iterative event loop** optimized for performance. Each event transitions through lifecycle statuses:

- **NEW (0):** Initial state. Ready for processing.
- **PROGRESS (1):** Pre-action phase. Listeners can transform/negate (e.g., negate incoming damage).
- **DONE (2):** Post-action phase. Reactions to effects (e.g., heal after taking damage).
- **NULLIFY (-1):** Request to cancel the event.
- **NULLIFIED (-2):** Event has been cancelled and will not proceed.

### Iterative Loop Structure

The event loop (`runEventLoop`) executes up to 100 iterations. Each iteration consists of three passes:

1.  **Pass 1: Reactions:** Listeners are given a chance to react to each event in the queue. If a listener reacts, it can mutate the event (e.g., change its status) or emit additional events. If the status changes, the listener loop restarts for that event to ensure all listeners see the new status.
2.  **Pass 2: Processors:** For events that reached the `PROGRESS` status, the corresponding effect is applied to the state via the `StateManager`.
3.  **Pass 3: Queue Advancement:** Events that are `DONE` or `NULLIFIED` are removed. Remaining events have their status advanced (e.g., `NEW` → `PROGRESS`, `PROGRESS` → `DONE`).

### Status Transformation & Loop Restart

The engine supports dynamic status transformation within the listener chain. If any listener changes the status of an event (e.g., from `PROGRESS` to `NULLIFY`), the listener pass **restarts** for that event.

This ensures that all listeners get a chance to react to the new status regardless of their position in the listener array.

Recursion is prevented by the `processedBy` markers, which track both the listener ID and the status (`listenerId-status`). Once a listener has processed an event at a specific status, it will skip it in subsequent passes for that same status.

### Example: Anti-Nullify Flow

1.  **Attack (PROGRESS)** is in the queue.
2.  **Negate Listener** reacts to `PROGRESS` → Changes status to `NULLIFY`. Loop restarts.
    - Event `processedBy`: `[negate-PROGRESS]`
3.  **Anti-Nullify Listener** reacts to `NULLIFY` → Changes status back to `PROGRESS`. Loop restarts.
    - Event `processedBy`: `[negate-PROGRESS, antiNullify-NULLIFY]`
4.  **Negate Listener** sees `PROGRESS` again. It checks its `processedBy` marker (`negate-PROGRESS`). It's already there, so it **skips**.
5.  **Attack (PROGRESS)** is successfully applied to state.

### Listener Processing

Each listener can:

- **Pass through:** Return `null` (event continues unchanged)
- **Transform:** Mutate the event and return it (e.g., change value or status)
- **Negate:** Change event status to `NULLIFY`
- **Emit additional:** Return `[event, newEvent1, newEvent2]` (adds effects with status `NEW`)

## Stage 3: Effect Processing

**Where:** `projects/game-board/engine/events-processor.ts:#applyProcessor`

After listeners react to an event, if it is in the `PROGRESS` status, the `EngineEventsProcessor` applies it to the state using its internal `EngineStateManager`:

```typescript
this.stateManager.applyEffect(playerKey, event.effect);
```

The `EngineStateManager` is responsible for applying atomic effects and managing the game state (health, speed, items, status effects, turn queue, and action history).

**Available Atomic Operations:** Read `projects/game-board/engine/state-manager.ts`. Operations now mutate the state directly for performance.

## Important Design Principles

1.  **Event Status Lifecycle** - Events progress `NEW` → `PROGRESS` → `DONE` (or `NULLIFY` → `NULLIFIED`).
2.  **StateManager apply at PROGRESS** - Core logic (damage, heal, etc.) is applied to state when event status is `PROGRESS`.
3.  **Durations decrement at PROGRESS** - Listener durations (Turns, Charges) only decrement once per event lifecycle, specifically when status is `PROGRESS`.
4.  **Performance Optimization via Mutation** - Events and state are mutated during the event loop to reduce object allocations and improve performance.
5.  **Action History** - All primary actions (`PLAY_ITEM`, `PASS`, `SURRENDER`) are recorded in the `actionHistory` within the state.
6.  **Conditions are compiled** - `Condition` → `ReactiveCondition` at creation time for high-performance matching.
7.  **Infinite Loop Protection** - Each reaction is tracked via `processedBy: listenerId-status`. Total event depth limit is 50, and loop iteration limit is 100.

## Debugging Tips

- Use `engine.consumeLog()` to see event flow
- Check `BaseEffectInstance.wrapResult()` for listener lifecycle
- Look at existing tests for usage patterns
- Remember: `shouldReact()` is called on EVERY event, keep it fast

## Files to Read for Deep Understanding

**Core Flow:**
- `projects/game-board/engine/engine.ts` - Main orchestration
- `projects/game-board/engine/events-processor.ts` - Event loop logic
- `projects/game-board/engine/state-manager.ts` - State management and atomic mutations
- `projects/game-board/engine/effects/listener-factory.ts` - Listener creation

**Base Classes:**
- `projects/game-board/engine/effects/instances/base-effect-instance.ts` - Listener lifecycle
- `projects/game-board/engine/effects/conditions/create-condition.ts` - Condition compilation

**Type Definitions:**
- `projects/game-board/item/item.model.ts` - Core types
- `projects/game-board/engine/engine.types.ts` - Engine types

**Examples:**
- `projects/game-board/engine/effects/instances/listeners/` - All listener implementations
- `projects/game-board/board/test/` - Integration tests show usage patterns
