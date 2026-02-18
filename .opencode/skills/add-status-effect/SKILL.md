---
name: add-status-effect
description: Use this skill when adding a status effect to an item
---

# What you need

1. The item ID that should apply the status effect.
2. When the effect should trigger (condition).
3. What the effect should do (action).
4. How long the effect should last (duration).

# What to do

## Overview

Status effects are applied when an item is played via `whenPlayed()` and remain active for a specified duration. They react to game events and trigger their actions when conditions are met.

## 1. Add Status Effect to Item Behavior

**Where:** `projects/game-board/item-library/impl/{item-name}.behaviour.ts`

Add a status effect to your `whenPlayed()` method using `addStatusEffect`:

```typescript
import {
  addStatusEffect,
  charges,
  Effect,
  ItemBehavior,
  modifySpeed,
  statusEffect,
} from '../../item';

export class YourItemBehaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [
      addStatusEffect(
        statusEffect({
          condition: { type: 'after_effect', value: 'damage' },
          action: [modifySpeed(-1, 'enemy')],
          duration: charges(3),
        }),
        'self',
      ),
    ];
  }
}
```

### Key Components:

- **`condition`**: When the effect triggers (e.g., `{ type: 'after_effect', value: 'damage' }`, `onTurnEnd()`)
- **`action`**: What happens when triggered (e.g., `[modifySpeed(-1, 'enemy')]`, `[attack(5)]`, `[heal(3)]`)
- **`duration`**: How long the effect lasts:
  - `charges(n)` - lasts for n triggers
  - `turns(n)` - lasts for n turns
  - `permanent()` - lasts until manually removed
- **`target`**: Who receives the status effect ('self' or 'enemy')

## 2. Create Integration Test

**Where:** `projects/game-board/board/test/{item-name}.spec.ts`

Test the status effect triggers correctly and expires after duration:

```typescript
describe('Your Item Status Effect', () => {
  it('should trigger when condition is met', () => {
    const player1 = createMockPlayer('p1', {
      speed: 10,
      items: ['your_item'],
    });
    const player2 = createMockPlayer('p2', { speed: 5, items: ['_blueprint_attack'] });
    const board = new Board(player1, player2);

    // Play the item
    board.playItem('your_item', 'p1');

    // Trigger the condition
    board.playItem('_blueprint_attack', 'p2');

    // Assert the expected outcome
    expect(board.gameState.opponent.speed).toBe(expectedValue);
  });

  it('should expire after duration is consumed', () => {
    // Test that the effect stops after all charges/turns are used up
  });
});
```

## Reference: Conditions and Durations

For the complete list of available conditions and durations, read:

- **Conditions:** `projects/game-board/item/conditions.ts`
- **Durations:** `projects/game-board/item/durations.ts`
- **Actions:** `projects/game-board/item/effects.ts`

### Common Conditions:

- `beforeEffect(type)` - Triggered before an effect of the given type is applied
- `afterEffect(type)` - Triggered after an effect of the given type is applied
- `onTurnEnd()` - Triggered at the end of the player's turn
- `onPlay()` - Triggered when an item is played

### Common Durations:

- `charges(n)` - Effect lasts for n triggers
- `turns(n)` - Effect lasts for n turns
- `permanent()` - Effect lasts until manually removed

### Common Actions:

- `attack(value, target)` - Deal damage
- `heal(value, target)` - Restore health
- `modifySpeed(value, target)` - Change speed (negative to slow, positive to speed up)
- `removeItem(itemId, target)` - Remove an item from loadout
