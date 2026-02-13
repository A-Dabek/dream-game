# Board UI Module

This folder contains the in-game board layout and UI state wiring.

## Components

- **BoardUiComponent**: Main layout; renders hands, health bars, turn queue, last-played spotlight, and action history.
- **PlayerHandComponent**: Displays a hand of items with optional interactivity and leave animations.
- **TurnQueueComponent**: Shows the `TurnEntry[]` queue with skip-turn affordance for the player.
- **HealthBarComponent**: Shared health bar with player/opponent styling and percent math.
- **ActionHistoryComponent**: Compact icon log for recent actions.

## Data and Services

- **ActionHistoryEntry**: Presentation-friendly interface for recent actions, including an optional `genre` field so historical
  actions display the correct icon color even if item definitions change.
- **UiStateService**: Applies engine logs to UI state, tracks last played item and action history. Captures the genre of played
  items and includes it in action history entries for consistent icon coloring.
- **HumanInputService**: Captures UI intent and forwards it to the human strategy.
- **HumanStrategy**: Strategy implementation that waits on `HumanInputService` input.

## Notes

- The board relies on stable `TurnEntry.turnId` values from the engine for animation-friendly track-by logic.
- Item clicks and skip actions are translated into `GameActionType.PLAY_ITEM` events.
