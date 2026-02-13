# Common UI Module

Shared UI primitives and utilities used across the UI feature folders.

## Components

- **IconComponent**: Renders SVG paths from `assets/icons.json` using a consistent viewBox. Supports genre-specific colors via CSS variables.
- **ItemDisplayComponent**: Shows item icon + label with genre-specific icon colors. The label is derived from the item id.

## Utilities

- **icon-name.util.ts**: Maps item ids to icon names and provides `PASS_ICON_NAME` for skip actions.
- **genre-color.util.ts**: Provides `getGenreColor()` to map item genres to CSS color variables (e.g., `'basic'` → `var(--genre-basic)`).
  Used by components to apply genre-specific icon colors consistently.

## Notes

- Icon names are normalized by removing `_blueprint_` prefixes and replacing underscores with dashes.
