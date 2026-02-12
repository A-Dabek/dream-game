# Common UI Module

Shared UI primitives and utilities used across the UI feature folders.

## Components

- **IconComponent**: Renders SVG paths from `assets/icons.json` using a consistent viewBox.
- **ItemDisplayComponent**: Shows item icon + label; label is derived from the item id.

## Utilities

- **icon-name.util.ts**: Maps item ids to icon names and provides `PASS_ICON_NAME` for skip actions.

## Notes

- Icon names are normalized by removing `_blueprint_` prefixes and replacing underscores with dashes.
