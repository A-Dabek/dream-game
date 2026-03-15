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

**Where:** `projects/game-board/engine/engine.ts:#runEventLoop`

The engine uses a **multi-pass event loop**. Each event transitions through lifecycle statuses:

- **NEW (0):** Initial state. Ready for processing.
- **PROGRESS (1):** Pre-action phase. Listeners can transform/negate (e.g., negate incoming damage).
- **DONE (2):** Post-action phase. Reactions to effects (e.g., heal after taking damage).
- **NULLIFY (-1):** Request to cancel the event.
- **NULLIFIED (-2):** Event has been cancelled and will not proceed.

### Status Transformation & Loop Restart

The engine supports dynamic status transformation within the listener chain. If any listener changes the status of an event (e.g., from `PROGRESS` to `NULLIFY`), the pass **restarts** for that event. 

This ensures that all listeners get a chance to react to the new status regardless of their position in the listener array. 

Recursion is prevented by the `processedBy` markers, which track both the listener ID and the status (`listenerId-status`). Once a listener has processed an event at a specific status, it will skip it in subsequent passes for that same status.

### Example: Anti-Nullify Flow

1. **Attack (PROGRESS)** is in the queue.
2. **Negate Listener** reacts to `PROGRESS` → Changes status to `NULLIFY`. Loop restarts.
   - Event `processedBy`: `[negate-PROGRESS]`
3. **Anti-Nullify Listener** reacts to `NULLIFY` → Changes status back to `PROGRESS`. Loop restarts.
   - Event `processedBy`: `[negate-PROGRESS, antiNullify-NULLIFY]`
4. **Negate Listener** sees `PROGRESS` again. It checks its `processedBy` marker (`negate-PROGRESS`). It's already there, so it **skips**.
5. **Attack (PROGRESS)** is successfully applied to state.

### Listener Processing

At each pass (`processListenersPass`), listeners react to events based on their status. 
To prevent infinite recursion, each reaction is marked with `listenerId-status` in the `processedBy` array.

Each listener can:

- **Pass through:** Return `null` (event continues unchanged)
- **Transform:** Return modified event (e.g., change value or status)
- **Negate:** Return event with status `NULLIFY`
- **Emit additional:** Return `[event, newEvent1, newEvent2]` (adds effects with status `NEW`)

### Listener Lifecycle

1. **Creation:** Two paths:
   - Passive listeners from items: `scanForListeners()` → `ListenerFactory.createPassive()`
   - Status effect listeners: `add_status_effect` processor → `createInitialListenerData()` → `ListenerFactory.deserialize()`

2. **Runtime:** `BaseEffectInstance.handle(event, state)`:
   - Checks `shouldReact()` using compiled condition
   - Calls `handleReaction()` for custom behavior
   - Updates duration tracking
   - Wraps result with potential self-removal

3. **Removal:** Happens automatically when:
   - Duration expires (charges/turns run out)
   - Associated item is removed
   - Listener emits `remove_listener` effect

## Stage 3: Effect Processing

**Where:** `projects/game-board/engine/events-processor.ts:#applyProcessor`

After all listeners process the event, basic effects hit the `EngineStateManager` via `EngineEventsProcessor`:

```typescript
stateManager.applyEffect(playerKey, effect)
```

The `EngineStateManager` is responsible for applying the most basic and atomic effects to the engine state.

**Available Atomic Operations:** Read `projects/game-board/engine/state-manager.ts` for the complete list of methods like `applyEffect`, `removeListener`, `addStatusEffect`, `advanceTurn`, `updateListener`, and `updateAllListeners`.

## Key Types and Relationships

Read these type definitions:
- `projects/game-board/item/item.model.ts` - Effect, StatusEffect, PassiveEffect types
- `projects/game-board/engine/engine.types.ts` - GameEvent, GameEventStatus, Listener, EngineState types

**Type Hierarchy:**
```
StatusEffect (declarative config)
    ↓ wrapped by
BaseEffectInstance (runtime listener)
    ↓ produces
GameEvent (event flow)
    ↓ if type === 'effect'
Effect (atomic operation processed by StateManager)
```

## Common Patterns

### Pattern 1: Static Passive Effect
Uses DefaultListener automatically. Just define in behavior:

```typescript
import { PassiveEffect } from '../../item';
import { ActiveEffectLibrary, StatusEffectLibrary } from '../../../effect-library';

passiveEffects(): PassiveEffect[] {
  return [
    {
      type: 'some_passive',
      condition: ConditionLibrary.onTurnEnd(),
      action: [ActiveEffectLibrary.attack(1)],
      duration: permanent(),
    },
  ];
}
```

### Pattern 2: Dynamic Value Effect
Custom listener reads from state:

```typescript
protected handleReaction(event, state) {
  if (!this.shouldReact(event, state)) return null;
  
  const player = getPlayer(state, this.playerId);
  const value = calculateFrom(player);
  
  return [event, {
    type: 'effect',
    effect: { type: 'healing', value, target: 'self' },
    playerId: this.playerId,
  }];
}
```

### Pattern 3: Event Interceptor (Negate)
Request event cancellation by setting status to `NULLIFY`:

```typescript
protected handleReaction(event, state) {
  if (!this.shouldReact(event, state)) return null;
  return [{ ...event, status: GameEventStatus.NULLIFY }];
}
```

### Pattern 4: Event Transformer (Invert)
Modifies effect values at `PROGRESS` status:

```typescript
protected handleReaction(event, state) {
  if (!this.shouldReact(event, state)) return null;
  
  // Transform the effect value
  return [{
    ...event,
    effect: { ...event.effect, value: -event.effect.value }
  }];
}
```

## Important Design Principles

1. **Event Status Lifecycle** - Events progress `NEW` → `PROGRESS` → `DONE` (or `NULLIFY` → `NULLIFIED`).
2. **StateManager apply at PROGRESS** - Core logic (damage, heal, etc.) is applied to state when event status is `PROGRESS`.
3. **Durations decrement at PROGRESS** - Listener durations (Turns, Charges) only decrement once per event lifecycle, specifically when status is `PROGRESS`.
4. **Events are immutable** - Transform via cloning, never mutate original event objects.
5. **State changes only in StateManager** - Listeners emit events, EngineStateManager applies them to state snapshot.
6. **Conditions are compiled** - `Condition` → `ReactiveCondition` at creation time for high-performance matching.
7. **Infinite Loop Protection** - Each reaction is tracked via `processedBy: listenerId-status`. Total event depth limit is 50.

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
