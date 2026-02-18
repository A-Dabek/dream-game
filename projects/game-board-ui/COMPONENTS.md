# Components

Overview of all UI components in the game-board-ui library.

---

## Board Components

### TurnQueueComponent

- **Selector:** `app-turn-queue`
- **Children:** `IconComponent`
- **Purpose:** Displays the upcoming turn order with faction indicators and skip turn buttons.

### PlayerHandComponent

- **Selector:** `app-player-hand`
- **Children:** `ItemDisplayComponent`
- **Purpose:** Renders a horizontal scrollable list of item cards for a player.

### BoardUiComponent

- **Selector:** `app-board-ui`
- **Children:** `PlayerHandComponent`, `TurnQueueComponent`, `ItemDisplayComponent`, `ActionHistoryComponent`, `HealthBarComponent`
- **Purpose:** Main game board layout organizing opponent area, player area, and center game content.

### ActionHistoryComponent

- **Selector:** `app-action-history`
- **Children:** `IconComponent`
- **Purpose:** Shows a chronological list of played actions with faction attribution.

### HealthBarComponent

- **Selector:** `app-health-bar`
- **Children:** None
- **Purpose:** Visual health indicator with colored fill bar and numeric health text.

---

## Common Components

### ItemDisplayComponent

- **Selector:** `app-item-display`
- **Children:** `IconComponent`
- **Purpose:** Card component displaying an item's icon and name label.

### IconComponent

- **Selector:** `app-icon`
- **Children:** None
- **Purpose:** Renders SVG icons with configurable size and color via CSS variables.

---

## Game Components

### GameContainerComponent

- **Selector:** `app-game-container`
- **Children:** `BoardUiComponent`, `PreGameScreenComponent`, `PostGameScreenComponent`
- **Purpose:** Root container managing screen transitions between pre-game, game, and post-game states.

### PreGameScreenComponent

- **Selector:** `app-pre-game-screen`
- **Children:** `PlayerHandComponent`
- **Purpose:** Initial setup screen showing opponent vs player hands with reveal animations.

### PostGameScreenComponent

- **Selector:** `app-post-game-screen`
- **Children:** `PlayerHandComponent`
- **Purpose:** Game over screen displaying final hands and winner/loser headlines.

---

## Component Hierarchy

```
GameContainerComponent
├── PreGameScreenComponent
│   └── PlayerHandComponent
│       └── ItemDisplayComponent
│           └── IconComponent
├── BoardUiComponent
│   ├── PlayerHandComponent (opponent)
│   │   └── ItemDisplayComponent
│   │       └── IconComponent
│   ├── HealthBarComponent (opponent)
│   ├── TurnQueueComponent
│   │   └── IconComponent
│   ├── ItemDisplayComponent (last played)
│   │   └── IconComponent
│   ├── ActionHistoryComponent
│   │   └── IconComponent
│   ├── HealthBarComponent (player)
│   └── PlayerHandComponent (player)
│       └── ItemDisplayComponent
│           └── IconComponent
└── PostGameScreenComponent
    ├── PlayerHandComponent (opponent)
    │   └── ItemDisplayComponent
    │       └── IconComponent
    └── PlayerHandComponent (player)
        └── ItemDisplayComponent
            └── IconComponent
```

---

## Styling Reference

For detailed HTML structure and CSS classes, see:

- `styles/component-tree.html` - Pseudo-HTML tree showing all elements and classes
- `styles/components/` - Individual SCSS files per component
