# Overview

This is an Angular monorepo for a turn-based card-like 1v1 game with the following projects:

## Projects

- `projects/game-board` (`game-board`): Core gameplay modules (engine, board, item, player, rating, AI, turn-manager).
- `projects/game-board-ui` (`game-board-ui`): Angular UI application for the game board.
- `projects/dream-game` (`dream-game`): Main app code responsible mainly for routing and bootstrapping.

## Gameplay

- The game is a duel between two players – one human and one AI.
- Each player has attributes: health and speed.
- When a player's health reaches 0, the game is over.
- Speed is responsible for turn order and can be modified by items.
- Each player has a loadout of items that can be played once per turn.
- Items can inflict effects on players, and those can be: active, passive and status.
- Active effects are one-time effects applied immediately.
- Status effects are lingering effects that last for a certain duration.
- Passive effects are special case of a status effect that lasts as long as the player has an item which applies the effect.

## Development

- For commands refer to the package.json scripts section.
- E2E tests are written in Playwright and are located in `e2e'.
- Webapp assets are located in `assets`.
