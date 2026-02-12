# Game UI Module

Screen-level components and the main game container orchestration.

## Components

- **GameContainerComponent**: Controls pre/game/post stages, starts games, and wires `UiStateService` into the board.
- **PreGameScreenComponent**: Minimal VS screen with a Ready action and hand reveal animation.
- **PostGameScreenComponent**: Winner/loser screen with replay action.

## Notes

- `GameContainerComponent` swaps screens with slide transitions and advances stage based on UI state.
- The game container constructs the human/cpu players and triggers `GameService.startGame` on Ready.
