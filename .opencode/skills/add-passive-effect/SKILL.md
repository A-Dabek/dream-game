---
name: add-passive-effect
description: Use this skill when adding a passive effect to an item
---

# What you need

1. The item ID that should have the passive effect.
2. When the effect should trigger (condition).
3. What the effect should do (static or dynamic).

# What to do

## Overview

Passive effects trigger automatically while an item is in the player's loadout (not when played). There are two types:

- **Simple**: Static effects that use `DefaultListener` automatically
- **Complex**: Dynamic effects that require a custom listener class

## 1. Add passiveEffects() to Item Behavior

**Where:** `projects/game-board/item-library/impl/{item-name}.behaviour.ts`

Add the `passiveEffects()` method to your item behavior class:

```typescript
passiveEffects(): PassiveEffect[] {
  return [{
    type: 'your_item_id',  // Used by ListenerFactory to identify this effect
    condition: ConditionLibrary.onTurnStart(),  // When to trigger
    action: [],  // Static actions (optional for complex effects)
    duration: { type: 'permanent' },  // How long it lasts
  }];
}
```

## 2. Choose Implementation Path

### Path A: Simple Passive Effects

For static effects that don't depend on game state (e.g., "deal 1 damage at end of turn"):

```typescript
import { PassiveEffect } from '../../item';
import { ActiveEffectLibrary, StatusEffectLibrary } from '../../../effect-library';
import { ConditionLibrary } from '../../../item/conditions';

passiveEffects(): PassiveEffect[] {
  return [
    {
      type: 'your_item_id',
      condition: ConditionLibrary.onTurnEnd(),
      action: [ActiveEffectLibrary.attack(1)],
      duration: permanent(),
    },
  ];
}
```

That's it! The engine automatically creates a `DefaultListener`.

### Path B: Complex Passive Effects

For dynamic behavior that depends on game state (e.g., "heal based on item count"):

#### 2B.1 Create Custom Listener

**Where:** `projects/game-board/engine/effects/instances/listeners/{item-name}-listener.ts`

```typescript
import { onTurnStart, StatusEffect } from '../../../../item';
import { ActiveEffectLibrary } from '../../../effect-library';
import { EngineState, GameEvent } from '../../../engine.model';
import { BaseEffectInstance } from '../base-effect-instance';
import { ListenerData } from '../../listener-factory';
import { ReactiveCondition } from '../../conditions';

export class YourItemListener extends BaseEffectInstance {
  protected override handleReaction(
    event: GameEvent,
    state: EngineState,
    data: ListenerData,
    condition: ReactiveCondition,
  ): GameEvent[] | null {
    if (!this.shouldReact(event, state, data, condition)) {
      return null;
    }

    // Calculate value from game state
    const player =
      state.playerOne.id === data.playerId
        ? state.playerOne
        : state.playerTwo;
    const healAmount = player.items.length;

     // Emit healing effect using ActiveEffectLibrary
     const healEvent: GameEvent = {
       type: 'effect',
       effect: ActiveEffectLibrary.heal(healAmount, 'self'),
       playerId: data.playerId,
     };

    return [event, healEvent];
  }
}
```

#### 2B.2 Export Listener

**Where:** `projects/game-board/engine/effects/instances/listeners/index.ts`

Add to the exports:

```typescript
export * from './{item-name}-listener';
```

#### 2B.3 Register in ListenerFactory

**Where:** `projects/game-board/engine/effects/listener-factory.ts`

1. Import your listener:

```typescript
import {
  // ... existing imports
  YourItemListener,
} from './instances/listeners';
```

2. Register in `LISTENER_MAP` object:

```typescript
const LISTENER_MAP: Record<string, new (data: ListenerData) => Listener> = {
  // ... existing mappings
  your_item_id: YourItemListener,
};
```

## 3. Create Integration Test

**Where:** `projects/game-board/board/test/{item-name}.spec.ts`

Test the passive effect triggers correctly:

```typescript
describe('Your Item Passive Effect', () => {
  it('should trigger at the right time', () => {
    const player1 = createMockPlayer('p1', {
      speed: 10,
      items: ['your_item'],
      health: 50,
    });
    const player2 = createMockPlayer('p2', { speed: 1 });
    const board = new Board(player1, player2);

    // Assert the expected outcome
    expect(board.playerHealth).toBe(expectedValue);
  });

  it('should stop when item is removed', () => {
    // Test that playing/removing the item stops the effect
  });
});
```

## Reference: Conditions and Durations

For the complete list of available conditions and durations, read:

- **Conditions:** `projects/game-board/item/conditions.ts`
- **Durations:** `projects/game-board/item/durations.ts`
