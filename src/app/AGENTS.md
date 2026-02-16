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

### [UI](../ui)

Angular components for displaying the game (now located in `src/ui`):

- **Structure**: `common/` (icons, item display), `board/` (board layout, hands, turn queue, action history, UI state), `game/` (container + pre/post screens), `styles/` (global SCSS).
- **Mobile First**: Layout optimized for mobile (player at bottom, opponent at top, turn order on left).
- **Reactive**: Built with Angular signals for high performance.
- **Screens**: Pre-game `PreGameScreen` and post-game `PostGameScreen` with slide transitions orchestrated by `GameContainerComponent`.
- **Last Played Spotlight**: `BoardUiComponent` reserves the center for `lastPlayedItem` plus action-history icons sourced from `UiStateService`.

Styling:

- All component styles are consolidated into the global stylesheet `src/ui/styles/styles.scss`, referenced from `angular.json` under `projects.dream-project.architect.build.options.styles`.
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
