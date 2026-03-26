# Overview

This is an Angular (v21) monorepo for a turn-based card-like 1v1 game with the following projects:

## Projects

- `projects/game-board` (`game-board`): Core gameplay modules (engine, board, item, player, rating, AI, turn-manager).
- `projects/game-board-ui` (`game-board-ui`): Angular UI application for the game board.
- `projects/dream-game` (`dream-game`): Main app code responsible mainly for routing and bootstrapping.
- `projects/game-initialization` (`game-initialization`): Project for creating randomized players and calculating their ELO rating via game orchestration.
- `projects/e2e` (`e2e`): End-to-end tests using Playwright.

## Build System

This project uses **Turborepo** for optimized build orchestration. The `turbo.json` file defines tasks for:

- `build` - Compiles all projects with dependency-aware caching
- `test` - Runs unit tests across all projects
- `api-extractor` - Generates TypeScript API documentation
- `e2e` - Runs Playwright end-to-end tests
- `init-game` - Initializes game data

All tasks are accessed via npm scripts in the root `package.json` (e.g., `npm run build`, `npm run test`, `npm run e2e`).

## Gameplay

- The game is a duel between two players – one human and one AI.
- Each player has attributes: health and speed.
- When a player's health reaches 0, the game is over.
- Speed is responsible for turn order and can be modified by items.
- Each player has a loadout of items that can be played once per turn.
- The game state tracks all actions taken by players in a chronological action history.
- Items can inflict effects on players, and those can be: active, passive and status.
- Active effects are one-time effects applied immediately.
- Status effects are lingering effects that last for a certain duration.
- Passive effects are special case of a status effect that lasts as long as the player has an item which applies the effect.
- When a player has no items left, they suffer increasing damage from "Impatience" at the end of each of their turns.

## Development

- Before starting development check out a new branch from `master`.
- E2E tests are written in Playwright and are located in `projects/e2e`.
- Webapp assets are located in `assets`.
- UI Conventions (icons, descriptions) are located in `projects/game-board-ui/conventions/`. They use a type-safe registry to map IDs to resources and SVG paths.

## Useful scripts

- You can find scripts in `.opencode/scripts` directory.

### Scripts Description

| Script                | Description                                                                                | Usage                                   |
| --------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------- |
| `acceptance-tests.sh` | Runs the full acceptance test suite including build, all unit tests, and E2E tests         | `./acceptance-tests.sh`                 |
| `verify-work.sh`      | Runs all verification checks: format, build, test, API extractor, E2E tests, and init-game | `./verify-work.sh`                      |
| `deploy-work.sh`      | Commits work, merges to develop, and deploys to Firebase                                   | `./deploy-work.sh --commit "<message>"` |
