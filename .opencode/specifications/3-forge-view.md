# Specification: Forge View

## Overview

The **Forge View** allows players to craft random items from the basic item pool. Crafted items automatically go to the backpack.

## Layout Structure

### Center: Item Card

A large centered card displaying either:
- **Before craft:** A large question mark ("?")
- **After craft:** The randomized item's details

```
┌─────────────────────────────────┐
│                                 │
│            [ICON]               │
│                                 │
│         Item Name               │
│                                 │
│    Description text goes        │
│    here in multiple lines       │
│                                 │
│  HP: 10              Speed: 5   │
│                                 │
└─────────────────────────────────┘
```

Card specifications:
- Centered both horizontally and vertically
- Fixed size (e.g., 300px width)
- Icon at top, name below, description below that (all centered)
- HP value bottom-left, Speed value bottom-right
- Dark background with solid border

### Bottom: Craft Button

```
(Anvil icon) Craft new item (Matrix icon) 2
```

- Always visible at bottom of view
- Costs 2 matrices to craft
- Disabled if player has < 2 matrices

### Bottom Right: Proceed Button

```
[Proceed]
```

- Navigates to Backpack view

## Crafting Behavior

### Initial State

- Card displays a large centered "?" (question mark)
- No item details shown
- Craft button enabled if matrices >= 2

### On Craft Click

1. Deduct 2 matrices from player currency
2. Select random item from basic items pool
3. Play zoom-in + flash animation:
   - Card scales from small to full size
   - Brief flash/glow effect
   - Item fades in
4. Display crafted item:
   - Icon at top
   - Name below icon
   - Description below name
   - HP value bottom-left
   - Speed value bottom-right
5. Add item to backpack automatically
6. Craft button remains enabled for another craft

### Animation Details

- Duration: ~300ms total
- Zoom in: Scale 0.5 → 1.0 with ease-out
- Flash: Brief white/yellow overlay that fades
- Item reveal: Opacity 0 → 1 with slight delay after scale completes

## Crafting Pool

Items are drawn from `basic-items.json` in conventions:
- `hand`
- `punch`
- `sticking_plaster`
- `sticky_boot`
- `wingfoot`

Note: Blueprint items (starting with `_blueprint_`) are excluded from the forge pool.

## Components to Create

### ForgeViewComponent

**File:** `projects/game-board-ui/game-loop/forge-view.component.ts`

**Imports:**
- GameLoopStateService
- Router
- ItemDisplayComponent
- IconComponent

**State:**
- `craftedItem: signal<Item | null>` - current item being displayed (null = show "?")
- `isAnimating: signal<boolean>` - animation in progress flag

**Methods:**
- `craft()` - triggers crafting sequence
- `navigateToBackpack()` - routes to backpack

**Template:**
```
<main class="forge-container">
  <article class="item-card" [class.animating]="isAnimating()">
    @if (craftedItem()) {
      <app-item-display [item]="craftedItem()!" />
      <h2 class="item-name">{{ craftedItem()!.name }}</h2>
      <p class="item-description">{{ craftedItem()!.description }}</p>
      <div class="item-stats">
        <span class="stat hp">HP: {{ craftedItem()!.hp }}</span>
        <span class="stat speed">Speed: {{ craftedItem()!.speed }}</span>
      </div>
    } @else {
      <span class="question-mark">?</span>
    }
  </article>

  <button class="craft-btn" 
          [disabled]="matrices() < 2 || isAnimating()"
          (click)="craft()">
    <app-icon [path]="anvilIconPath" />
    Craft new item
    <app-icon [path]="matrixIconPath" /> 2
  </button>

  <button class="proceed-btn" (click)="navigateToBackpack()">
    Proceed
  </button>
</main>
```

## Item Data Structure

Items from the forge should include:
- `id: ItemId` - unique identifier
- `name: string` - display name
- `description: string` - tooltip/description text
- `icon: string` - icon name for lookup in convention registry
- `hp: number` - HP value (placeholder, e.g., +5 for heal items, 0 for attack)
- `speed: number` - Speed value (placeholder, e.g., +2 for boots, 0 for attack)

## Icons (Placeholders)

Temporary icons from `icon-paths.json`:
- `stun-grenade` - placeholder for anvil/craft icon
- `dummy` - placeholder for matrix currency icon

These will be replaced with proper icons later.

## Acceptance Criteria

1. Initial state shows large "?" centered on card
2. Craft button shows cost "(Matrix icon) 2"
3. Craft button disabled when matrices < 2
4. Clicking Craft deducts 2 matrices
5. Clicking Craft randomizes item from basic pool
6. Card animates with zoom-in + flash effect
7. Crafted item displays: icon, name, description, HP, Speed
8. Crafted item automatically added to backpack
9. "Proceed" button navigates to Backpack view
10. Multiple crafts possible without page refresh

## Animation CSS

```scss
.item-card {
  transition: transform 0.2s ease-out, opacity 0.2s ease-out;
  
  &.animating {
    animation: forge-craft 0.3s ease-out;
  }
}

@keyframes forge-craft {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
    filter: brightness(1.5);
  }
  100% {
    transform: scale(1);
    opacity: 1;
    filter: brightness(1);
  }
}
```
