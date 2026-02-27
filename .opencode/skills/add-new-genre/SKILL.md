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

## 2. (Optional) Create UI Convention Files

**Where:** `projects/game-board-ui/conventions/`

If items or status effects in this genre need custom display metadata (overriding naming conventions), create JSON files for them:
- `{genre}-items.json`
- `{genre}-status-effects.json`

Example `{genre}-items.json`:
```json
{}
```

## 3. Register Genre in Registry

**Where:** `projects/game-board-ui/conventions/convention-registry.ts`

1. Import the new JSON files.
2. Add the genre to `GENRE_CONFIGS` mapping.

```typescript
import {genre}ItemsJson from './{genre}-items.json';
import {genre}StatusEffectsJson from './{genre}-status-effects.json';

// ...

const GENRE_CONFIGS: Record<Genre, GenreConfig> = {
  // ...
  {genre}: {
    items: {genre}ItemsJson,
    statusEffects: {genre}StatusEffectsJson,
  },
};
```

## 4. Add Color Mapping

**Where:** `projects/game-board-ui/common/genre-color.util.ts`

Add the genre to the `colorMap` record with its CSS variable reference.

## 5. Add CSS Variable

**Where:** `projects/game-board-ui/styles/_tokens.scss`

Add a new `--genre-{name}` CSS variable under the "Genre colors" section with the desired color.
