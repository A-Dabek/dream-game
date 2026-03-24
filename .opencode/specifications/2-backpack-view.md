# Specification: Backpack View

## Overview

The **Backpack View** displays the player's equipment slots and expandable storage for items.

## Layout Structure

### Top Section: Equipment Slots

A single horizontal row of 5 slots for equipped items.

```
[ slot 1 ] [ slot 2 ] [ slot 3 ] [ slot 4 ] [ slot 5 ]
```

- **Empty slot:** Dashed border (`border-style: dashed`)
- **Filled slot:** Solid thicker border (`border-style: solid`, thicker width)
- Slot size matches existing `--hand-item-size` CSS variable

### Middle Section: Backpack Storage

A grid layout with 5 columns and N rows (starts at 1 row = 5 slots total).

```
[ item ] [ item ] [ item ] [ item ] [ item ]
[ item ] [ item ] [ item ] [ item ] [ item ]
...
```

- Grid expands vertically (more rows)
- Uses existing grid styling from player-hand component
- Scrollable if content exceeds viewport

### Top Right: Expand Button

```
[Expand] (Matrix icon) 1
```

- Always visible in top-right corner
- Deducts 1 matrix from player currency when clicked
- Adds one additional row to the backpack grid

### Bottom Right: Proceed Button

```
[Proceed]
```

- Navigates to the next view (Forge)
- Always visible in bottom-right corner

## Item Interactions

### Clicking an Item

1. **Click equipped item** → Enters "move from equipped" mode
2. **Click empty backpack slot** → Moves item to that position
3. **Click filled backpack slot** → Swaps items
4. **Click elsewhere** → Cancels move mode

5. **Click backpack item** → Enters "move from backpack" mode
6. **Click empty equip slot** → Moves item to equipment
7. **Click filled equip slot** → Swaps items
8. **Click elsewhere** → Cancels move mode

### Move Animation

When items move in a straight line (same column or same row):
- Item should visually animate/glide from source to destination
- Brief but smooth transition effect
- Does not disappear and reappear - animates along the path

## Components to Create

### BackpackViewComponent

**File:** `projects/game-board-ui/game-loop/backpack-view.component.ts`

**Imports:**
- GameLoopStateService (for state access)
- Router (for navigation)

**Template Structure:**
```
<section class="equipment-section">
  <div class="equip-slot" 
       *ngFor="let item of equippedItems(); let i = index"
       [class.filled]="item !== null"
       (click)="onEquipSlotClick(i)">
    <app-item-display *ngIf="item" [item]="item" />
  </div>
</section>

<section class="backpack-section">
  <button class="expand-btn" (click)="expandBackpack()">
    Expand <app-icon [path]="matrixIconPath" /> 1
  </button>
  
  <div class="backpack-grid">
    <div class="backpack-slot"
         *ngFor="let item of backpackItems(); let i = index"
         [class.filled]="item !== null"
         (click)="onBackpackSlotClick(i)">
      <app-item-display *ngIf="item" [item]="item" />
    </div>
  </div>
</section>

<button class="proceed-btn" (click)="navigateToForge()">
  Proceed
</button>
```

## State Requirements

### GameLoopStateService Additions

- `backpackRows: signal<number>` - current grid rows (min: 1)
- `equippedItems: signal<(Item | null)[]>` - 5 equip slots
- `backpackItems: signal<Item[]>` - flattened backpack grid
- `expandBackpack()` - adds row, deducts 1 matrix
- `moveItem(fromIndex: number, toIndex: number, fromArea: 'equip' | 'backpack', toArea: 'equip' | 'backpack')`

## Acceptance Criteria

1. 5 equipment slots displayed in a horizontal row at top
2. Empty equip slots have dashed border
3. Filled equip slots have solid thicker border
4. Backpack displays 5-column grid with N rows (starts at N=1)
5. "Expand" button shows matrix icon + "1" cost
6. Clicking Expand adds a row and deducts 1 matrix
7. Clicking an item enters move mode with visual feedback
8. Clicking a valid target moves/swaps the item with animation
9. "Proceed" button navigates to Forge view
10. Move animation glides items in straight lines (not disappear/reappear)

## Icons (Placeholders)

Use temporary placeholder icons from `icon-paths.json`:
- `hand` - placeholder for item icons
- `dummy` - placeholder for matrix currency icon

These will be replaced with proper icons later.
