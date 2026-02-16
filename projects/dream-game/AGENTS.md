# Dream Game Application

The `dream-game` project is the main application for the Dream Project. It focuses on routing, main views, and orchestrating the game experience.

## Structure

- `game/`: Main game orchestration components and services.
- `app.ts`, `app.config.ts`, `app.routes.ts`: Application shell and configuration.
- `main.ts`: Application entry point.
- `styles.scss`, `game-container.scss`: Application-specific styles.

## Components and Services

- **GameContainerComponent**: Orchestrates pre/game/post stages and wires `UiStateService` (from `@dream/ui`) to the board.
- **UrlGameConfigService**: Parses game configuration from URL parameters to initialize the game.

## Dependencies

- Uses `@dream/ui` for board game components and logic.
- Uses `@dream/game` for game engine logic.
