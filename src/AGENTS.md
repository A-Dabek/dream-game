# Source Tree

Projects have been moved under the top-level `projects/` directory.

## Projects

- `projects/game-board` (`game-board`): Core gameplay modules (engine, board, item, player, rating, AI, turn-manager).
- `projects/game-board-ui` (`game-board-ui`): Angular UI application.

## Layout

- `projects/game-board`: Logic modules. Each module has its own `AGENTS.md`.
- `projects/game-board-ui`: UI components and services. Includes its own `index.html` and entry points.

## Notes

- Build and test commands are available per project via `ng build <project>` and `ng test <project>`.
- The main UI entrypoint is `projects/game-board-ui/main.ts`.
