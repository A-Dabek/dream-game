# Game Board UI Library

The `game-board-ui` project is an Angular library providing components and logic related to board games and dueling.

## Structure

- `common/`: Shared display components (icons, item tiles) and icon-name utilities.
- `board/`: Board layout, hands, turn queue, action history, and UI state services.
- `game/`: Pre/post game screens.
- `game-logic/`: Angular-specific logic services (e.g., `GameService`) and bridges to core `game-board/` logic.
- `styles/`: Global SCSS, tokens, and component-level styles (see `styles/AGENTS.md`).

## Components and Services

- **IconComponent**: Renders SVG icons from the shared `assets/icons.json` library.
- **ItemDisplayComponent**: Displays a single item using the icon-name mapping utility.
- **PlayerHandComponent**: Renders a list of items with interactive selection and leave animations.
- **TurnQueueComponent**: Presents `TurnEntry[]` from the engine and exposes skip-turn UI for the player.
- **HealthBarComponent**: Shared health bar with percent math and player/opponent variants.
- **ActionHistoryComponent**: Compact icon log for recent actions with slide-in animations.
- **BoardUiComponent**: Main board layout, combines hands, turn queue, last-played spotlight, and action history.
- **PreGameScreenComponent**: Minimal VS screen with ready action and hand reveal animation.
- **PostGameScreenComponent**: Result screen with winner/loser labels and replay button.
- **UiStateService**: Applies engine logs to UI state, tracks last played item and action history.
- **HumanInputService / HumanStrategy**: Bridge UI intent to the board strategy layer.
- **SoundService**: Manages audio playback for item sound effects. Plays item-specific sounds from `assets/sfx/<icon-name>.wav` with fallback to `assets/sfx/basic.wav`.

## Features

- **Signal-based**: Uses Angular signals (`input`, `computed`) for efficient state management and change detection.
- **OnPush Change Detection**: Ensures optimal performance by only re-rendering when inputs change.
- **WCAG AA Compliant**: Follows accessibility standards for color contrast and ARIA attributes.

## Sound System

- **SoundService**: Injectable service for audio playback
- **File Naming**: `assets/sfx/<icon-name>.wav` based on item's icon name
- **Fallback**: Falls back to `assets/sfx/basic.wav` if item-specific sound not found
- **Integration**: Triggered by `UiStateService` when processing 'on_play' events

## Styling

Global styles, design tokens, and layout-specific styling are documented in `styles/AGENTS.md`.

## Recent UI Updates

- Sound effects system added with `SoundService` - plays item-specific audio when items are used.
- Action history row added to `BoardUiComponent` for quick scanning of recent plays.
- Last-played spotlight remains centered between health bars for quick state comprehension.
- Turn queue animations use stable `TurnEntry.turnId` values from the engine for track-by safety.
- Pre/post screens share a unified minimal style and slide transitions via `GameContainerComponent`.

## API Extractor

Tooling: @microsoft/api-extractor for generating API documentation and type rollups.

### Generated Files

Running `npm run api-extractor:game-board-ui` produces:

1. **`game-board-ui.api.md`** - API report showing the public API surface (imports/exports)
2. **`game-board-ui.d.ts`** - Consolidated TypeScript declarations with full type definitions

### Viewing Full Type Declarations

To see complete type definitions with all properties and methods:

**Open `game-board-ui.d.ts`** - This file contains the full declarations:

- All exported Angular components with their inputs, outputs, and methods
- All exported services with their public methods and properties
- All exported interfaces and types

The .d.ts rollup includes full class definitions (e.g., `export declare class BoardUiComponent { ... }`)
with all public members visible, unlike the .api.md file which shows imports/exports.

### Usage

Generate both files:

```bash
npm run api-extractor:game-board-ui
```

This command:

1. Compiles TypeScript declarations to `dist/types/game-board-ui/`
2. Runs API Extractor analysis
3. Creates/updates both `.api.md` and `.d.ts` files in the project root

### Release Tags

Add TSDoc annotations to suppress warnings and document API stability:

- `@public` - Part of the stable public API
- `@beta` - Experimental API subject to change
- `@alpha` - Early preview, highly unstable
- `@internal` - For internal use only
