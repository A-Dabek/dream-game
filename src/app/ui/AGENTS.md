# UI Module

The UI module provides Angular components for displaying the game state and facilitating player interaction.

## Components

- **IconComponent**: Displays SVG icons from a central icon library.
- **ItemDisplayComponent**: Renders a single item with its icon and label.
- **PlayerHandComponent**: Displays a list of items (either the player's or opponent's). Supports interactivity for the player's hand.
- **TurnQueueComponent**: Shows a vertical list of upcoming turns on the left side of the screen. Supports skipping the current turn for the human player via a pulsing icon.
- **BoardUiComponent**: The main container component that orchestrates the overall game layout for mobile view. It uses `HumanInputService` to submit player decisions and `GameService` to process game logs with a throttle of 500ms.
- **HumanInputService**: Facilitates communication between UI components and `HumanStrategy`.
- **HumanStrategy**: Implementation of `Strategy` that waits for UI input via `HumanInputService`.

## Features

- **Mobile First**: Designed with a layout optimized for mobile screens.
- **Signal-based**: Uses Angular signals (`input`, `computed`) for efficient state management and change detection.
- **OnPush Change Detection**: Ensures optimal performance by only re-rendering when inputs change.
- **Dark Themed**: Features a sleek, minimalistic dark theme with low-saturation colors.
- **WCAG AA Compliant**: Follows accessibility standards for color contrast and ARIA attributes.
