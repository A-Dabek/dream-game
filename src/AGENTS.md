# Source Tree

This directory holds two Angular projects: `game-board` (logic) and `game-board-ui` (UI).

## Projects

- `app/` (`game-board`): Core gameplay modules (engine, board, item, player, rating, AI, turn-manager).
- `ui/` (`game-board-ui`): Angular UI application.

## Layout

- `app/`: Logic modules. Each module has its own `AGENTS.md`.
- `ui/`: UI components and services. Includes its own `index.html` and entry points.

## Notes

- Build and test commands are available per project via `ng build <project>` and `ng test <project>`.
- The main UI entrypoint is `src/ui/main.ts`.
