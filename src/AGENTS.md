# Source Tree

This directory holds the game logic (`app/`) and the Angular UI (`ui/`).

## Layout

- `app/`: Core gameplay modules (engine, board, item, player, rating, AI, game, turn-manager). Each module has its own `AGENTS.md`.
- `ui/`: Angular UI entrypoint plus UI feature folders (`board/`, `common/`, `game/`, `styles/`).
- `index.html`: Shell HTML for the Angular application.

## Notes

- The build entrypoint is `src/ui/main.ts` and global styles live in `src/ui/styles/styles.scss`.
