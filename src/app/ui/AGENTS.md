# UI Module

The UI module provides Angular components for displaying the game state and facilitating player interaction.

## Components

- **IconComponent**: Displays SVG icons from a central icon library.
- **ItemDisplayComponent**: Renders a single item with its icon and label.
- **PlayerHandComponent**: Displays a list of items (either the player's or opponent's). Supports interactivity for the player's hand and automatic slide-out animations when items are played or removed.
- **TurnQueueComponent**: Shows a vertical list of upcoming turns on the left side of the screen. Supports skipping the current turn for the human player via a pulsing icon. The component now purely renders the `TurnEntry[]` it receives from `UiStateService`, relying on the engine/TurnManager to guarantee stable `id`s for animation-aware track-by logic.
- **GameContainerComponent**: The top-level UI component that creates players, displays VS screen with Ready button to start game via slide animation, manages `UiStateService` initialization, and provides state to `BoardUiComponent`.
- **BoardUiComponent**: Orchestrates the overall game layout for mobile view. It receives a non-nullable `GameState` from `GameContainerComponent`.
- **VsScreenComponent**: Initial screen displaying "VS" centered with fade-in animations for opponent hand above and player hand below, plus Ready button to emit event for game start and slide left out.
 - **PreGameScreenComponent**: Initial screen displaying simplified "VS." text between opponent and player items with a minimal text-only "Ready" button. Uses subtle hand reveal animation. Unified style with the post-game screen.
- **UiStateService**: Consumes `GameService.logs$` and applies `state-change` snapshots directly to the UI `GameState` with a small delay for animations. It now passes the full `TurnEntry[]` queue through to components (alongside the extracted current/next `playerId`s) without trying to regenerate IDs client-side.
- **HumanInputService**: Facilitates communication between UI components and `HumanStrategy`.
- **HumanStrategy**: Implementation of `Strategy` that waits for UI input via `HumanInputService`.

## Features

- **Signal-based**: Uses Angular signals (`input`, `computed`) for efficient state management and change detection.
- **OnPush Change Detection**: Ensures optimal performance by only re-rendering when inputs change.
- **WCAG AA Compliant**: Follows accessibility standards for color contrast and ARIA attributes.

## Styling

Global styles, design tokens, and layout-specific styling are documented in [src/styles/AGENTS.md](../../styles/AGENTS.md).

## Recent UI Updates

- Pre- and post-game screens now use a unified, minimal design: common headline styling for `VS.` and `Winner/Loser` labels, and a shared text-only button style used for "Ready" and "New Game". This ensures consistent presentation across screens and adheres to accessibility and performance best practices.
- Item Play Animations: Items now slide towards the center of the board and fade out when removed from the hand (upwards for players, downwards for opponents). This uses native Angular 21 CSS animation triggers (`animate.leave`). The animation now also smoothly shrinks the item's width and margin after it has slid and faded out, causing remaining items in the hand to slide into their new positions sequentially rather than simultaneously with the play animation.
- Last-played spotlight: The board center now dedicates a neutral surface to the `lastPlayedItem` signal from `UiStateService`, which mirrors `on_play` events without mutating the board module. The larger `app-item-display` tile (bigger icon/label and gentle fade-in) fills the space between the health bars so the most recent play reads clearly with minimal chrome.
