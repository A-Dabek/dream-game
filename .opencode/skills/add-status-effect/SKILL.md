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

Add a status effect to your `whenPlayed()` method using `ActiveEffectLibrary.add_status_effect`:

```typescript
import { Effect, ItemBehavior } from '../../item';
import { ActiveEffectLibrary, StatusEffectLibrary } from '../../../effect-library';
import { ConditionLibrary } from '../../../item/conditions';
import { charges } from '../../../item/durations';

export class YourItemBehaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [
      ActiveEffectLibrary.add_status_effect(
        {
          condition: ConditionLibrary.onTurnEnd(),
          action: [ActiveEffectLibrary.modifySpeed(-1, 'enemy')],
          duration: charges(3),
          mergeStrategy: 'increase', // Optional: merge with existing effects of same type
        },
        'self',
      ),
    ];
  }
}
```

### Key Components:

- **`condition`**: When the effect triggers (e.g., `ConditionLibrary.beforeEffect('damage')`, `ConditionLibrary.onTurnEnd()`)
- **`action`**: What happens when triggered (e.g., `[modifySpeed(-1, 'enemy')]`, `[attack(5)]`, `[heal(3)]`)
  - For self-damage, use `attack(value, 'self')` (default target is 'enemy')
- **`duration`**: How long the effect lasts:
  - `charges(n)` - lasts for n triggers
  - `turns(n)` - lasts for n turns
  - `permanent()` - lasts until manually removed
- **`target`**: Who receives the status effect ('self' or 'enemy')
- **`type`** (optional): Identifies the effect type (e.g., `type: 'poison'`) for interactions with items like antidotes or gas masks
- **`mergeStrategy`** (optional): Controls how the effect behaves when applied multiple times:
  - `'new'` (default): Creates a new status effect instance each time (duplicate effects)
  - `'increase'`: Merges charges with an existing effect of the same type on the target player
  - Only applies to effects with `duration.type === 'charges'`
  - Use `'increase'` for effects like poison that should stack (e.g., `mergeStrategy: 'increase'`)


## 2. Add Display Metadata

**Where:** `projects/game-board-ui/conventions/{genre}-status-effects.json` (e.g., `basic-status-effects.json`)

You **MUST** add an entry for the new status effect to the corresponding genre JSON file. The UI no longer automatically derives icon names or descriptions.

```json
{
  "super_poison": {
    "icon": "deadly-poison",
    "description": "Deals massive damage over time."
  }
}
```

The `icon` field should reference a valid icon name from `projects/game-board-ui/conventions/icon-paths.json`.

If you added a new status effect type, ensure it is also registered in `projects/game-board-ui/conventions/convention-registry.ts` within the `ALL_STATUS_EFFECTS` constant.


## 3. Create Integration Test

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
- **Effects:** `projects/game-board/effect-library/`

### Common Conditions:

- `ConditionLibrary.beforeEffect(type)` - Triggered before an effect of the given type is applied
- `ConditionLibrary.beforeStatusEffect(type)` - Triggered before a status effect of the given type is applied
- `ConditionLibrary.afterEffect(type)` - Triggered after an effect of the given type is applied
- `ConditionLibrary.onTurnEnd()` - Triggered at the end of the player's turn
- `ConditionLibrary.onPlay()` - Triggered when an item is played


### Common Durations:

- `charges(n)` - Effect lasts for n triggers
- `turns(n)` - Effect lasts for n turns
- `permanent()` - Effect lasts until manually removed

### Common Actions:

- `ActiveEffectLibrary.attack(value, target)` - Deal damage
- `ActiveEffectLibrary.heal(value, target)` - Restore health
- `ActiveEffectLibrary.modifySpeed(value, target)` - Change speed (negative to slow, positive to speed up)
- `ActiveEffectLibrary.remove_item(itemId, target)` - Remove an item from loadout
