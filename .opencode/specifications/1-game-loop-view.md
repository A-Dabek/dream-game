# Specification: Game Loop View

## Overview

The **Game Loop View** is the parent container for the roguelike mode, displaying player stats and providing access to Backpack and Forge sub-views via routing.

## Layout Structure

### Stats Bar (Fixed Top)

Displays player stats in a single horizontal line:
- (HP icon) (HP number) <space> (Speed icon) (Speed number) <space> (Matrix icon) (Matrices number)

Icons will be temporary placeholders until proper icons are added.

### Content Area

- Contains a `<router-outlet>` where child views (Forge and Backpack) render
- Takes up most of the viewport height

### Abandon Button (Below Viewport)

- Positioned below the visible screen, requiring scroll to access
- Always visible at the bottom of the page
- Clicking shows a confirmation dialog before resetting the run

## Routes

```
/game-loop          -> GameLoopViewComponent (parent)
/game-loop/forge    -> ForgeViewComponent
/game-loop/backpack -> BackpackViewComponent
```

Player always starts on `/game-loop/forge`.

## Components to Create

### GameLoopViewComponent

**File:** `projects/game-board-ui/game-loop/game-loop-view.component.ts`

**Inputs:** None (reads from GameLoopState service)

**Outputs:**
- `abandonRequested` - emitted when user confirms abandoning run

**Template:**
```
<app-stats-bar [stats]="stats()" />
<router-outlet />
<button class="abandon-btn" (click)="showAbandonDialog()">
  Abandon
</button>
```

### StatsBarComponent

**File:** `projects/game-board-ui/game-loop/stats-bar.component.ts`

**Inputs:**
- `stats: Signal<{ hp: number; speed: number; matrices: number }>`

**Template:** Horizontal layout with icon + value pairs for HP, Speed, and Matrices

## Services

### GameLoopStateService

**File:** `projects/game-board-ui/game-loop/game-loop-state.service.ts`

Provides signal-based state:
- `playerStats`: `{ hp: number; speed: number; matrices: number }`
- `backpackItems`: `Item[]` - items in backpack storage
- `equippedItems`: `[Item | null, Item | null, Item | null, Item | null, Item | null]` - 5 equip slots
- `backpackRows`: `number` - current backpack grid rows (starts at 1)

**Methods:**
- `resetRun()` - resets all state to initial values
- `addItemToBackpack(item: Item)` - adds item to first available backpack slot
- `moveItem(from: Position, to: Position)` - moves item between positions
- `expandBackpack()` - adds one row to backpack grid
- `deductMatrices(amount: number)` - decreases matrices currency

## Acceptance Criteria

1. Stats bar displays HP, Speed, and Matrices with icons in one horizontal line
2. Router outlet correctly renders Forge and Backpack child views
3. "Proceed" button in Forge navigates to Backpack
4. "Proceed" button in Backpack navigates to Forge (or battle - future)
5. Abandon button is positioned below the visible viewport
6. Clicking Abandon shows a confirmation dialog
7. Confirming Abandon resets the entire run state
8. All components use Angular v21 standalone architecture with signals

## State Management

The GameLoopStateService maintains run state:
- Player HP, Speed, Matrices
- Equipped items (5 slots)
- Backpack items (5 x N grid, starts with N=1)
- Current route for navigation
