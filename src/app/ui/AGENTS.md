# UI Module

The UI module provides Angular components for displaying the game state and facilitating player interaction.

## Components

- **IconComponent**: Displays SVG icons from a central icon library.
- **ItemDisplayComponent**: Renders a single item with its icon and label.
- **PlayerHandComponent**: Displays a list of items (either the player's or opponent's). Supports interactivity for the player's hand.
- **TurnQueueComponent**: Shows a vertical list of upcoming turns on the left side of the screen. Supports skipping the current turn for the human player via a pulsing icon.
- **GameContainerComponent**: The top-level UI component that creates players, displays VS screen with Ready button to start game via slide animation, manages `UiStateService` initialization, and provides state to `BoardUiComponent`.
- **BoardUiComponent**: Orchestrates the overall game layout for mobile view. It receives a non-nullable `GameState` from `GameContainerComponent`.
- **VsScreenComponent**: Initial screen displaying "VS" centered with fade-in animations for opponent hand above and player hand below, plus Ready button to emit event for game start and slide left out.
 - **PreGameScreenComponent**: Initial screen displaying simplified "VS." text between opponent and player items with a minimal text-only "Ready" button. Uses subtle hand reveal animation. Unified style with the post-game screen.
- **UiStateService**: Implements event-sourcing for the UI. It consumes `GameService.logs$`, reconstructs the `GameState` locally with a delay for animations, and validates it against the engine's state during human turns. Turn information is synchronized from the engine state after each turn. Verified by black-box fatigue tests in `ui-state.service.spec.ts`.
- **HumanInputService**: Facilitates communication between UI components and `HumanStrategy`.
- **HumanStrategy**: Implementation of `Strategy` that waits for UI input via `HumanInputService`.

## Features

- **Mobile First**: Designed with a layout optimized for mobile screens.
- **Signal-based**: Uses Angular signals (`input`, `computed`) for efficient state management and change detection.
- **OnPush Change Detection**: Ensures optimal performance by only re-rendering when inputs change.
- **Dark Themed**: Features a sleek, minimalistic dark theme with low-saturation colors.
- **WCAG AA Compliant**: Follows accessibility standards for color contrast and ARIA attributes.

## Recent UI Updates

- Pre- and post-game screens now use a unified, minimal design: common headline styling for `VS.` and `Winner/Loser` labels, and a shared text-only button style used for "Ready" and "New Game". This ensures consistent presentation across screens and adheres to accessibility and performance best practices.
- Global typography unified: a single system font stack is applied app-wide for consistent readability.
- Readability improvements: larger headline and button font sizes with tighter letter spacing.
- Responsive fix: prevent `.player-section` from overflowing the `.container` on small screens by constraining width and allowing shrink.
