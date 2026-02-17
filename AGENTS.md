# Overview

This is an Angular monorepo for a turn-based card-like 1v1 game with the following projects:

## Projects

- `projects/game-board` (`game-board`): Core gameplay modules (engine, board, item, player, rating, AI, turn-manager).
- `projects/game-board-ui` (`game-board-ui`): Angular UI application for the game board.
- `projects/dream-game` (`dream-game`): Main app code responsible mainly for routing and bootstrapping.

## Development

- For commands refer to the package.json scripts section.
- E2E tests are written in Playwright and are located in `e2e'.
- Webapp assets are located in `assets`.
