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
[Stage 1: Event Generation] → Creates GameEvent
    ↓
[Stage 2: Listener Chain] → Listeners transform/consume/emit events
    ↓
[Stage 3: Effect Processing] → Processors apply effects to state
    ↓
State Updated
```

Read these files to understand the complete flow:
- `projects/game-board/engine/engine.ts` - Main engine orchestration
- `projects/game-board/engine/processors.ts` - Effect processors
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

**Where:** `projects/game-board/engine/engine.ts:#processEvent`

Uses recursive chain-of-responsibility pattern. Each listener can:

- **Pass through:** Return `null` (event continues unchanged)
- **Transform:** Return modified array of events
- **Swallow:** Return empty array `[]` (event disappears)
- **Emit additional:** Return `[event, newEvent1, newEvent2]` (adds effects)

### Listener Lifecycle

1. **Creation:** Two paths:
   - Passive listeners from items: `scanForListeners()` → `ListenerFactory.createPassive()`
   - Status effect listeners: `add_status_effect` processor → `ListenerFactory.createStatusEffect()`

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

**Where:** `projects/game-board/engine/processors.ts:#play`

After all listeners process the event, basic effects hit processors:

```typescript
PROCESSORS: Record<ProcessorType, EffectProcessor>
```

Each processor is a pure function: `(state, playerKey, effect) => newState`. 
Processors are responsible for applying the most basic and atomic effects. 
They should NEVER be modified unless the EngineState interface changes.

**Available Processors:** Read `projects/game-board/engine/processors.ts` for the complete list.

## Key Types and Relationships

Read these type definitions:
- `projects/game-board/item/item.model.ts` - Effect, StatusEffect, PassiveEffect types
- `projects/game-board/engine/engine.types.ts` - GameEvent, Listener, EngineState types

**Type Hierarchy:**
```
StatusEffect (declarative config)
    ↓ wrapped by
BaseEffectInstance (runtime listener)
    ↓ produces
GameEvent (event flow)
    ↓ if type === 'effect'
Effect (atomic operation processed by Processors)
```

## Common Patterns

### Pattern 1: Static Passive Effect
Uses DefaultListener automatically. Just define in behavior:

```typescript
passiveEffects(): PassiveEffect[] {
  return [{
    condition: onTurnEnd(),
    action: [attack(1)],  // Static - used by DefaultListener
    duration: permanent(),
  }];
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
Consumes events by returning empty array:

```typescript
protected handleReaction(event, state) {
  return this.shouldReact(event, state) ? [] : null;
}
```

### Pattern 4: Event Transformer (Invert)
Modifies effect values:

```typescript
protected handleReaction(event, state) {
  if (!this.shouldReact(event, state)) return null;
  
  // Transform the effect
  const transformed = {
    ...event,
    effect: { ...event.effect, value: -event.effect.value }
  };
  
  return [transformed];
}
```

## Important Design Principles

1. **Events are immutable** - Transform, never mutate
2. **State changes only in processors** - Listeners emit events, processors apply them
3. **Conditions are compiled** - `Condition` → `ReactiveCondition` at creation time
4. **Listeners are long-lived** - They persist across turns until removed
5. **Depth limit** - Event chain has max depth of 50 to prevent infinite loops

## Debugging Tips

- Use `engine.consumeLog()` to see event flow
- Check `BaseEffectInstance.wrapResult()` for listener lifecycle
- Look at existing tests for usage patterns
- Remember: `shouldReact()` is called on EVERY event, keep it fast

## Files to Read for Deep Understanding

**Core Flow:**
- `projects/game-board/engine/engine.ts` - Main orchestration
- `projects/game-board/engine/processors.ts` - State mutations
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
