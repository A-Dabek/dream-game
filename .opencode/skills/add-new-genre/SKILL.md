---
name: add-new-genre
description: Use this skill when adding a new genre to the game
---

# What you need

1. Name of the genre (e.g., "fire", "ice", "nature").
2. Desired color for the genre (hex or CSS variable reference).

# What to do

## 1. Update Genre Type

**Where:** `projects/game-board/item/item.model.ts`

Add the new genre to the `Genre` type union.

## 2. Create UI Convention Files

**Where:** `projects/game-board-ui/conventions/`

All items and status effects in this genre **MUST** have display metadata in JSON files. Create:
- `{genre}-items.json`
- `{genre}-status-effects.json`

Example `{genre}-items.json`:
```json
{
  "genre_item_id": {
    "icon": "icon-name",
    "description": "Item description"
  }
}
```

Ensure the icons referenced are present in `projects/game-board-ui/conventions/icon-paths.json`.

## 3. Register Items and Status Effects

**Where:** `projects/game-board-ui/conventions/convention-registry.ts`

1. Import the new JSON files.
2. Add the items from your genre to `ALL_ITEMS` constant.
3. Add the status effects from your genre to `ALL_STATUS_EFFECTS` constant.

```typescript
import {genre}ItemsJson from './{genre}-items.json';
import {genre}StatusEffectsJson from './{genre}-status-effects.json';

// ...

export const ALL_ITEMS = {
  // ...
  ...{genre}ItemsJson,
} satisfies ItemConventionMap;

export const ALL_STATUS_EFFECTS = {
  // ...
  ...{genre}StatusEffectsJson,
} satisfies StatusEffectConventionMap;
```


## 4. Add Color Mapping

**Where:** `projects/game-board-ui/common/genre-color.util.ts`

Add the genre to the `colorMap` record with its CSS variable reference.

## 5. Add CSS Variable

**Where:** `projects/game-board-ui/styles/_tokens.scss`

Add a new `--genre-{name}` CSS variable under the "Genre colors" section with the desired color.
