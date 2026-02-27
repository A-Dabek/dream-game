---
name: add-new-item
description: Use this skill when adding a new item to the game
---

# What you need

1. Name of the item (e.g., `super_punch`).
2. Description of the item's effects.
3. Genre of the item (e.g., `basic` or `poison`).

# What to do

## 1. Add Item ID

**Where:** `projects/game-board/item/item.model.ts`

Add the item ID to the `ItemId` type union.

## 2. Define Item Behavior

**Where:** `projects/game-board/item-library/item-registry.ts`

Add a new function to the `ItemLibrary` object that returns an `ItemDefinition`.
Ensure you specify the correct `genre` and `onPlayEffects`.

Example:
```typescript
  super_punch: (): ItemDefinition => ({
    genre: 'basic',
    onPlayEffects: [ActiveEffectLibrary.attack(10)],
  }),
```

## 3. (Optional) Add Display Metadata Override

**Where:** `projects/game-board-ui/conventions/{genre}-items.json` (e.g., `basic-items.json`)

By default, the UI derives the icon name and description from the Item ID:
- `super_punch` -> icon `super-punch`, description `Super Punch`

If you need a custom icon or a specific description, add an entry to the corresponding genre JSON file:

```json
{
  "super_punch": {
    "icon": "heavy-punch",
    "description": "A powerful punch that deals 10 damage."
  }
}
```

## 4. Create Integration Test

**Where:** `projects/game-board/board/test/{item-name}.spec.ts`

Test item effects and ensure they work as expected.
