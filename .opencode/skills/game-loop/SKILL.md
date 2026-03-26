---
name: game-loop
description: Use this skill when modifying or extending the roguelike game loop in dream-game
---

# Overview

The game loop is the roguelike progression system in `projects/dream-game/game-loop/`. It's an early implementation that manages a single "run" where the player prepares before entering the main combat game.

**Note:** This is a work-in-progress system. The full loop (dungeon exploration, combat encounters, etc.) is not yet implemented.

# Architecture

## Core Files

| File | Purpose |
|------|---------|
| `game-loop-state.service.ts` | Central state management using Angular signals |
| `game-loop-view.component.ts` | Main container component |
| `backpack-view.component.ts` | Inventory + equipment management |
| `forge-view.component.ts` | Item crafting system |
| `stats-bar.component.ts` | Player stats display (HP, Speed, Matrices) |

## State Management (`GameLoopStateService`)

Located at: `projects/dream-game/game-loop/game-loop-state.service.ts`

Uses Angular signals for reactive state:

```typescript
// Core state signals
matrices: Signal<number>        // Currency for crafting/expanding
backpackItems: Signal<(Item | null)[]>
equippedItems: Signal<(Item | null)[]>
backpackRows: Signal<number>
moveMode: Signal<MoveMode | null> // For item drag-and-drop

// Computed
playerStats: Computed<PlayerStats> // HP, Speed, Matrices
```

## Player Stats

| Stat | Base Value | Description |
|------|-------------|-------------|
| HP | 1 | Health - from base + equipped item bonuses |
| Speed | 1 | Turn order modifier - from base + equipped item bonuses |
| Matrices | 10 | Currency for crafting and backpack expansion |

Item stat bonuses are defined in `ITEM_STATS` constant:
```typescript
const ITEM_STATS: Partial<Record<ItemId, ItemBonusStats>> = {
  sticking_plaster: { hp: 10, speed: 0 },
  wingfoot: { hp: 0, speed: 5 },
  sticky_boot: { hp: 0, speed: -2 },
};
```

## Views Flow

```
GameLoopView (container)
    ├── StatsBar (always visible)
    ├── RouterOutlet
    │   ├── BackpackView (initial)
    │   │   ├── Equipment slots (5)
    │   │   ├── Backpack grid (expandable)
    │   │   └── Actions: Expand, Proceed to Forge
    │   └── ForgeView
    │       ├── Random item crafting (costs 2 matrices)
    │       └── Proceed back to Backpack
    └── Abandon button (resets run)
```

## Key Operations

### Moving Items
- Click item to start move → click destination to complete
- Items can move between: equipped slots ↔ backpack slots

### Expanding Backpack
- Costs 1 matrix per expansion
- Adds one new empty slot to backpack

### Crafting (Forge)
- Costs 2 matrices per craft
- Randomly selects from `FORGE_ITEM_POOL`
- Items are added to first available backpack slot
- Available items: `hand`, `punch`, `sticking_plaster`, `sticky_boot`, `wingfoot`

### Abandoning Run
- Shows confirmation dialog
- Resets all state: matrices to 10, clears inventory, resets backpack to 1 row

# Common Tasks

## Adding a New Craftable Item

1. **Add to forge pool**: Edit `FORGE_ITEM_POOL` in `forge-view.component.ts`
2. **Add stat bonuses**: Edit `ITEM_STATS` in `game-loop-state.service.ts`
3. **Add UI metadata**: Add to `projects/game-board-ui/conventions/basic-items.json`

## Adding New Player Stats

1. **Define stat**: Add to `PlayerStats` interface in `game-loop-state.service.ts`
2. **Set base value**: Add constant (e.g., `BASE_STAT`)
3. **Compute total**: Update `playerStats` computed signal to include bonuses
4. **Display**: Update `StatsBarComponent` template

## Adding New Inventory Slots

1. **Equipment**: Modify `Array(5).fill(null)` in service initialization
2. **Backpack**: Modify initial backpack array and update template loops

# Dependencies

- Uses `Item` and `ItemId` types from `@dream/game-board`
- Uses UI components from `projects/dream-game/common/` (Button, Dialog, Icon, etc.)
- Uses `ItemCardComponent` from `@dream/game-board-ui`
