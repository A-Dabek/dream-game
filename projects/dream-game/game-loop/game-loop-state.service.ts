import { Injectable, signal, computed } from '@angular/core';
import { Item, ItemId } from '@dream/game-board';

export interface PlayerStats {
  hp: number;
  speed: number;
  matrices: number;
}

export type Position =
  | { type: 'backpack'; index: number }
  | { type: 'equipped'; slot: number };

export interface MoveMode {
  active: boolean;
  item: Item;
  fromArea: 'equip' | 'backpack';
  fromIndex: number;
}

// Base stats - player starts with these
const BASE_HP = 1;
const BASE_SPEED = 1;
const BASE_MATRICES = 10;

// Stats lookup for items (hp/speed bonuses)
const ITEM_STATS: Partial<Record<ItemId, { hp: number; speed: number }>> = {
  hand: { hp: 0, speed: 0 },
  punch: { hp: 0, speed: 0 },
  sticking_plaster: { hp: 10, speed: 0 },
  sticky_boot: { hp: 0, speed: -2 },
  wingfoot: { hp: 0, speed: 5 },
};

@Injectable({
  providedIn: 'root',
})
export class GameLoopStateService {
  readonly matrices = signal(BASE_MATRICES);

  readonly backpackItems = signal<(Item | null)[]>(Array(1).fill(null));
  readonly equippedItems = signal<(Item | null)[]>(Array(5).fill(null));
  readonly backpackRows = signal<number>(1);
  readonly moveMode = signal<MoveMode | null>(null);

  // Computed stats based on base + equipped items
  readonly playerStats = computed<PlayerStats>(() => {
    const equipped = this.equippedItems();
    let bonusHp = 0;
    let bonusSpeed = 0;

    for (const item of equipped) {
      if (item) {
        const stats = ITEM_STATS[item.id];
        if (stats) {
          bonusHp += stats.hp;
          bonusSpeed += stats.speed;
        }
      }
    }

    return {
      hp: BASE_HP + bonusHp,
      speed: BASE_SPEED + bonusSpeed,
      matrices: this.matrices(),
    };
  });

  resetRun(): void {
    this.matrices.set(BASE_MATRICES);
    this.backpackItems.set(Array(1).fill(null));
    this.equippedItems.set(Array(5).fill(null));
    this.backpackRows.set(1);
    this.moveMode.set(null);
  }

  addItemToBackpack(item: Item): void {
    const currentItems = this.backpackItems();
    const emptyIndex = currentItems.indexOf(null);
    if (emptyIndex !== -1) {
      currentItems[emptyIndex] = item;
      this.backpackItems.set([...currentItems]);
    } else {
      // If no empty slot, perhaps expand, but for now, do nothing
    }
  }

  moveItem(from: Position, to: Position): void {
    const itemToMove = this.getItemAt(from);
    if (itemToMove === null) {
      return;
    }

    this.setItemAt(from, null);
    this.setItemAt(to, itemToMove);
  }

  private getItemAt(position: Position): any {
    const items = this.getItemsForPosition(position);
    const index = position.type === 'backpack' ? position.index : position.slot;
    return items[index];
  }

  private setItemAt(position: Position, item: any): void {
    const itemsSignal =
      position.type === 'backpack' ? this.backpackItems : this.equippedItems;
    const index = position.type === 'backpack' ? position.index : position.slot;

    itemsSignal.update((items) => {
      const updated = [...items];
      updated[index] = item;
      return updated;
    });
  }

  private getItemsForPosition(position: Position): readonly any[] {
    return position.type === 'backpack'
      ? this.backpackItems()
      : this.equippedItems();
  }

  expandBackpack(): void {
    if (this.matrices() >= 1) {
      this.deductMatrices(1);
      this.backpackItems.update((items) => [...items, null]);
    }
  }

  deductMatrices(amount: number): void {
    this.matrices.update((value) => value - amount);
  }
}
