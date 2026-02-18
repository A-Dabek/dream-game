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

## 2. Add Genre to Registry Mapping

**Where:** `projects/game-board/item-library/item-registry.ts`

Add entries to `ITEM_GENRES` for all items that should use this genre.

## 3. Add Color Mapping

**Where:** `projects/game-board-ui/common/genre-color.util.ts`

Add the genre to the `colorMap` record with its CSS variable reference.

## 4. Add CSS Variable

**Where:** `projects/game-board-ui/styles/_tokens.scss`

Add a new `--genre-{name}` CSS variable under the "Genre colors" section with the desired color.
