---
name: add-new-item
description: Use this skill when adding a new item to the game
---

# What you need

1. Name of the item and its icon name.
2. Description of the item's effects and any special interactions.

# What to do

## 1. Create Behaviour

**Where:** `projects/game-board/item-library/impl/{item-name}.behaviour.ts`

Create a class implementing `ItemBehavior` with a `whenPlayed()` method returning effects.

> **Smart Active Effects (Advanced)**: For effects that need to compute values dynamically at runtime (e.g., damage based on item count, health differences), use smart effect types. Effect handlers are located in `projects/game-board/engine/effects/handlers/`. The `EffectHandlerFactory` maps effect types to handler instances.
> 
> **Example** - Using a smart effect handler:
> ```typescript
> whenPlayed() {
>   return [{
>     type: 'item_count_damage',  // Triggers ItemCountDamageHandler
>     value: 0,  // Value is computed by handler at runtime
>     target: 'enemy'
>   }];
> }
> ```
> 
> For most items, continue using static effects via `ActiveEffectLibrary`. Use smart effects only when you need dynamic value computation based on game state.

**Note**: To apply an effect to both players (area-effect), return two separate `ActiveEffectLibrary.add_status_effect` calls:
```typescript
import { ActiveEffectLibrary, StatusEffectLibrary } from '../../../effect-library';

// To apply an effect to both players:
return [
  ActiveEffectLibrary.add_status_effect(effect, 'self'),
  ActiveEffectLibrary.add_status_effect(effect, 'enemy'),
];
```

## 2. Add Item ID

**Where:** `projects/game-board/item/item.model.ts`

Add the item ID to the `ItemId` type union.

## 3. Export Behaviour

**Where:** `projects/game-board/item-library/impl/index.ts`

Export the behaviour class.

## 4. Register Behaviour

**Where:** `projects/game-board/item-library/item-registry.ts`

Import and add to `BEHAVIORS` record.

## 5. Add Genre Mapping

**Where:** `projects/game-board/item-library/item-registry.ts`

Add entry to `ITEM_GENRES` with the item's genre (usually 'basic' for new items).

## 6. Add Display Metadata

**Where:** `projects/game-board-ui/common/item-display-map.ts`

Add entry to `ITEM_DISPLAY_MAP` with icon name and description.

## 7. Create Integration Test

**Where:** `projects/game-board/board/test/{item-name}.spec.ts`

Test item effects and loadout removal.
