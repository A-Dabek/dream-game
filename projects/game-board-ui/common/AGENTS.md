# Common UI Module

Shared UI primitives and utilities used across the UI feature folders.

## Components

- **IconComponent**: Renders SVG paths from `assets/icons.json` using a consistent viewBox. Supports genre-specific colors via CSS variables.
- **ItemDisplayComponent**: Shows item icon + label with genre-specific icon colors. The label is derived from the item id.

## Utilities

- **item-display-map.ts**: Maps each `ItemId` to its display metadata (icon name and description) via `ITEM_DISPLAY_MAP`.
  Also provides `PASS_ICON_NAME` for skip actions and `getItemDisplayMetadata()` helper.
- **genre-color.util.ts**: Provides `getGenreColor()` to map item genres to CSS color variables (e.g., `'basic'` → `var(--genre-basic)`).
  Used by components to apply genre-specific icon colors consistently.

## Notes

- ItemId and icon name are now decoupled. Display metadata lives in `ITEM_DISPLAY_MAP`.
- When adding a new item, you must add an entry to both:
  1. The `ItemId` type in `src/app/item/item.model.ts`
  2. The `ITEM_DISPLAY_MAP` in `src/ui/common/item-display-map.ts`
