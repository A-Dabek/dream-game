# UI Module

The UI module provides Angular components for displaying the game state and facilitating player interaction.

## Structure

- `common/`: Shared display components (icons, item tiles) and icon-name utilities.
- `board/`: Board layout, hands, turn queue, action history, and UI state services.
- `game/`: GameContainer plus pre/post game screens and transitions.
- `styles/`: Global SCSS, tokens, and component-level styles (see `styles/AGENTS.md`).
- Entry points: `main.ts`, `app.ts`, `app.config.ts`, `app.routes.ts`, and `index.ts` exports.

## Components and Services

- **IconComponent**: Renders SVG icons from the shared `assets/icons.json` library.
- **ItemDisplayComponent**: Displays a single item using the icon-name mapping utility.
- **PlayerHandComponent**: Renders a list of items with interactive selection and leave animations.
- **TurnQueueComponent**: Presents `TurnEntry[]` from the engine and exposes skip-turn UI for the player.
- **HealthBarComponent**: Shared health bar with percent math and player/opponent variants.
- **ActionHistoryComponent**: Compact icon log for recent actions with slide-in animations.
- **BoardUiComponent**: Main board layout, combines hands, turn queue, last-played spotlight, and action history.
- **GameContainerComponent**: Orchestrates pre/game/post stages and wires `UiStateService` to the board.
- **PreGameScreenComponent**: Minimal VS screen with ready action and hand reveal animation.
- **PostGameScreenComponent**: Result screen with winner/loser labels and replay button.
- **UiStateService**: Applies engine logs to UI state, tracks last played item and action history.
- **HumanInputService / HumanStrategy**: Bridge UI intent to the board strategy layer.

## Features

- **Signal-based**: Uses Angular signals (`input`, `computed`) for efficient state management and change detection.
- **OnPush Change Detection**: Ensures optimal performance by only re-rendering when inputs change.
- **WCAG AA Compliant**: Follows accessibility standards for color contrast and ARIA attributes.

## Styling

Global styles, design tokens, and layout-specific styling are documented in `styles/AGENTS.md`.

## Recent UI Updates

- Action history row added to `BoardUiComponent` for quick scanning of recent plays.
- Last-played spotlight remains centered between health bars for quick state comprehension.
- Turn queue animations use stable `TurnEntry.turnId` values from the engine for track-by safety.
- Pre/post screens share a unified minimal style and slide transitions via `GameContainerComponent`.
