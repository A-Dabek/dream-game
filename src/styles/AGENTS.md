# Styles Module

This module contains the global styles, design tokens, and shared animations for the application.

## Structure

- `_tokens.scss`: Design tokens including colors, spacing, and typography variables.
- `_mixins.scss`: Shared SCSS mixins for themes, layouts, and animations.
- `_base.scss`: Global base styles, typography resets, and fundamental layout rules.
- `_animations.scss`: Shared CSS animations and transitions.
- `components/`: Component-specific global styles (for components that don't use encapsulated styles).

## Key Features

- **Design Tokens**: Centralized management of theme colors and sizing through CSS variables.
- **Mobile First**: Layouts optimized for mobile viewports using `svh/dvh/lvh` units.
- **Dark Theme**: Minimalistic dark theme with low-saturation colors.
- **Responsive Utilities**: Flexbox-based layout system with overflow protection.

## Recent Updates

- Global typography unified: a single system font stack is applied app-wide.
- Readability improvements: larger headline and button font sizes with tighter letter spacing.
- Responsive fix: constrained `.player-section` width to prevent overflow on small screens.
- Board layout stabilized: reserved vertical space for player and opponent hands; center area consumes leftover space with `min-height: 0`.
- Top/bottom sections use fixed heights via CSS custom properties; center area flexes to fill device height.
- Icon sizing moved to CSS variables: `app-icon` sizes via `--icon-size`.
- Hand/item size alignment: `app-item-display` uses `--hand-item-size` for consistency.
- Status row overflow fixed by removing outer margins and using `box-sizing: border-box`.
- SCSS Refactor: Introduced `_mixins.scss` to eliminate redundancy in animations and faction-based themes.
- Modernized SCSS: Migrated from `@import` to `@use` for better module management.
- UI Consistency: Unified viewport height handling across screens and containers using a shared mixin.
