---
name: game-loop
description: Use this skill when modifying or extending the roguelike game loop in dream-game
---

# Overview

The game loop is the roguelike progression system in `projects/dream-game/game-loop/`. It's an early implementation that manages a single "run" where the player prepares before entering the main combat game.

**Note:** This is a work-in-progress system. The full loop (dungeon exploration, combat encounters, etc.) is not yet implemented.

# Architecture

The game loop logic is split into several specialized services to follow the Single Responsibility Principle. Components inject these services privately and expose only the necessary state and methods for their templates.

## Core Files

| File | Purpose |
|------|---------|
| `game-loop-state.service.ts` | Facade for high-level operations (rewards, resetting, starting fights) |
| `campaign.service.ts` | Manages enemy loading and progression from CSV data |
| `player-progress.service.ts` | Manages player currency (matrices) and base stats |
| `item-management.service.ts` | Manages inventory, equipment, and movement logic |
| `forge.service.ts` | Manages item crafting and animations |
| `fight-manager.service.ts` | Orchestrates the transition to combat |
| `game-loop-view.component.ts` | Main container component with navigation and abandon logic |
| `backpack-view.component.ts` | Inventory + equipment management view |
| `forge-view.component.ts` | Item crafting view |
| `reward-view.component.ts` | Post-win reward display view |
| `stats-bar.component.ts` | Player stats display (HP, Speed, Matrices) |

## State Management

Reactive state is managed via Angular signals across multiple services.

### `GameLoopStateService` (Facade)
Located at: `projects/dream-game/game-loop/game-loop-state.service.ts`

- `playerStats`: Computed signal for HP, Speed, and Matrices.
- `resetRun()`: Resets all progress.
- `startFight()`: Initiates combat.
- `addReward(matrices: number)`: Adds currency to player.

### `ItemManagementService`
Located at: `projects/dream-game/game-loop/item-management.service.ts`

- `backpackItems`: Signal of `ForgedItemData | null` list.
- `equippedItems`: Signal of `ForgedItemData | null` list (equipment slots).
- `moveMode`: State for drag-and-drop item movement.
- `shakeSlot`: Animation state for validation failures.
- `addItemToBackpack(forgedItem: ForgedItemData)`: Adds a new item to the first available slot.

### `ForgeService`
Located at: `projects/dream-game/game-loop/forge.service.ts`

- `isAnimating`: State for crafting animation.
- `craftedItem`: The most recently crafted item.
- `canCraft`: Whether a new item can be forged (matrices + space check).
- `craft()`: Forges a new item from the pool.

### `CampaignService`
Located at: `projects/dream-game/game-loop/campaign.service.ts`

- `loadEnemies()`: Fetches and parses enemy configurations from `assets/players_elo.csv`.
- `getNextEnemy()`: Returns the next `EnemyConfig` in the sequence (cycling).
- `reset()`: Returns the enemy index to the beginning.
- `EnemyConfig`: Interface with `items` (string), `health` (number), and `speed` (number).

## Player Stats

| Stat | Base Value | Description |
|------|-------------|-------------|
| HP | 1 | Health - from base + equipped item bonuses (clamped to min 1) |
| Speed | 1 | Turn order modifier - from base + equipped item bonuses (clamped to min 1) |
| Matrices | 10 | Currency for crafting and backpack expansion |

Item stat bonuses are randomized upon forging using `forgeItemStats()`:
```typescript
export function forgeItemStats(): ItemBonusStats {
  const roll = biasedRoll(); // Biased random distribution
  return { hp: roll, speed: 5 - roll };
}
```

## Views Flow

```
GameLoopView (container)
    ├── StatsBar (always visible)
    ├── RouterOutlet
    │   ├── BackpackView (initial)
    │   │   ├── Equipment slots (5)
    │   │   ├── Backpack grid (expandable)
    │   │   └── Actions: Expand, Proceed to Forge, Start Fight
    │   ├── ForgeView
    │   │   ├── Random item crafting (costs 2 matrices)
    │   │   └── Proceed back to Backpack
    │   └── RewardView
    │       ├── Displays earned matrices (e.g., +4)
    │       └── Automatically adds reward via service
    └── Abandon button (resets run)
```

## Key Operations

### Moving Items
- Handled by `ItemManagementService.onSlotClick()`.
- Click item to start move → click destination to complete.
- Items can move between: equipped slots ↔ backpack slots.
- **Validation**: Equip/Unequip actions check if player stats (HP/Speed) drop below 1. Shakes source slot on failure.

### Expanding Backpack
- Handled by `ItemManagementService.expandBackpack()`.
- Costs 1 matrix per expansion.
- Adds one new empty slot to backpack.

### Crafting (Forge)
- Handled by `ForgeService.craft()`.
- Costs 2 matrices per craft.
- Randomly selects an ID from `FORGE_ITEM_POOL` (in `forge.service.ts`).
- Generates random stats for the item.
- Adds item to first available backpack slot.
- Available items: `hand`, `punch`, `sticking_plaster`, `sticky_boot`, `wingfoot`.

### Rewards
- Handled by `RewardViewComponent`.
- Adds a fixed amount of matrices (current: 4) using `GameLoopStateService.addReward()`.

### Abandoning Run
- Shows confirmation dialog.
- Resets all state: matrices, inventory, backpack size via `GameLoopStateService.resetRun()`.

### Enemy Progression
- Handled by `CampaignService`.
- Enemies are loaded from `assets/players_elo.csv`.
- Each enemy has fixed health, speed, and a pipe-separated string of items (e.g., `"hand|punch|wingfoot"`).
- The sequence is managed by `currentIndex`, which cycles through the list using `getNextEnemy()`.

# Common Tasks

## Adding a New Craftable Item

1. **Add to forge pool**: Edit `FORGE_ITEM_POOL` in `forge.service.ts`.
2. **Add UI metadata**: Add to `projects/game-board-ui/conventions/basic-items.json`.

## Adding New Player Stats

1. **Define stat**: Add to `PlayerStats` interface in `player-progress.service.ts`.
2. **Set base value**: Add constant in `player-progress.service.ts`.
3. **Handle bonuses**: Update `ItemBonusStats` and `playerStats` computed signal in `item-management.service.ts`.
4. **Display**: Update `StatsBarComponent` template.

## Adding New Inventory Slots

1. **Equipment**: Modify `Array(5).fill(null)` in `ItemManagementService`.
2. **Backpack**: Modify initial backpack array in `ItemManagementService`.

# Dependencies

- Uses `Item` and `ItemId` types from `@dream/game-board`.
- Uses UI components from `projects/dream-game/common/` (Button, Dialog, Icon, etc.).
- Uses `ItemCardComponent` from `@dream/game-board-ui`.
- Uses `IconComponent` and `ItemDisplayComponent` from `@shared-ui`.
