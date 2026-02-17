# Game Board Project

A turn-based game implementation where players use items to defeat opponents. This is the `game-board` Angular project, containing only pure logic and reactive state. It is configured as a headless application without an `index.html`.

## Modules

### [Item](./item)

The foundation module. Defines core data structures:

- **Items & Effects**: Atomic actions (damage, heal) and reactive passives/status effects.
- **Library**: Concrete item behaviors (blueprints).
- **Independent**: No dependencies on other modules.

### [Engine](./engine)

A synchronous, deterministic state machine built with Angular signals:

- **Responsibility**: Applies item effects and manages immutable game state snapshots.
- **Turn Management**: Delegates turn distribution to `TurnManager`, storing a shared `TurnEntry[]` (playerId + stable id) for consumers.
- **Passive Effects**: Uses a strategy pattern ([Effects Submodule](./engine/effects)) to handle triggers and durations.
- **Dependency**: Depends only on the `Item` module.

### [Board](./board)

The orchestration layer on top of the Engine:

- **Validation**: Ensures actions (Play Item, Pass, Surrender) are legal before delegating to the Engine.
- **Simulation**: Supports `clone()` for exploring future game states.

### [UI](../game-board-ui)

Angular components for displaying the game (now located in `projects/game-board-ui`):

- **Structure**: `common/` (icons, item display), `board/` (board layout, hands, turn queue, action history, UI state), `game/` (container + pre/post screens), `styles/` (global SCSS).
- **Mobile First**: Layout optimized for mobile (player at bottom, opponent at top, turn order on left).
- **Reactive**: Built with Angular signals for high performance.
- **Screens**: Pre-game `PreGameScreen` and post-game `PostGameScreen` with slide transitions orchestrated by `GameContainerComponent`.
- **Last Played Spotlight**: `BoardUiComponent` reserves the center for `lastPlayedItem` plus action-history icons sourced from `UiStateService`.

Styling:

- All component styles are consolidated into the global stylesheet `projects/game-board-ui/styles/styles.scss`, referenced from `angular.json` under `projects.game-board-ui.architect.build.options.styles`.
- Previous `:host` selectors were transformed to target component selectors (e.g., `app-pre-game-screen`, `app-post-game-screen`, `app-game-container`, `app-board-ui`, `app-player-hand`, `app-turn-queue`, `app-item-display`, `app-icon`, `app-action-history`) to preserve behavior without relying on encapsulation.
- No component declares inline `<style>` anymore; all styles live in the global file to simplify theming and maintenance.
- Shared colors and shadows are expressed as CSS custom properties under `:root` to enable easy theming.

### [AI](./ai)

Decision-making algorithms for CPU players:

- **Strategy Pattern**: Implements various algorithms (e.g., Minimax, FirstAvailable).
- **Mechanism**: Uses `Board` simulation to evaluate potential actions.

### [Rating](./rating)

A self-contained Elo-like system to track player performance.

### [Player](./player)

Integrates identity, rating, loadout, and AI:

- **Composite Object**: Wraps modules into a cohesive `Player` entity.
- **CPU Factory**: Includes a factory for generating randomized CPU opponents with 5 items and varying base attributes.
- **Dependency**: Orchestrates `Rating`, `Item`, and `AI`.

## API Extractor

Tooling: @microsoft/api-extractor for generating API documentation and type rollups.

### Generated Files

Running `npm run api-extractor:game-board` produces:

1. **`game-board.api.md`** - API report showing the public API surface (imports/exports)
2. **`game-board.d.ts`** - Consolidated TypeScript declarations with full type definitions

### Viewing Full Type Declarations

To see complete type definitions with all properties and methods:

**Open `game-board.d.ts`** - This file contains the full declarations:

- All exported classes with their properties and methods
- All exported interfaces with their fields
- All exported types and enums

Note: When types are re-exported from other modules (e.g., `export { Board } from './board'`),
the .d.ts rollup preserves the re-export structure. To see inlined declarations, the source
would need to use `export * from './module'` patterns or define types directly in index.ts.

### Usage

Generate both files:

```bash
npm run api-extractor:game-board
```

This command:

1. Compiles TypeScript declarations to `dist/types/game-board/`
2. Runs API Extractor analysis
3. Creates/updates both `.api.md` and `.d.ts` files in the project root

### Release Tags

If warnings appear about missing release tags, add TSDoc annotations to exported APIs:

- `@public` - Part of the stable public API
- `@beta` - Experimental API subject to change
- `@alpha` - Early preview, highly unstable
- `@internal` - For internal use only
