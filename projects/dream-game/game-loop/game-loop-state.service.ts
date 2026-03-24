import { Injectable, signal } from '@angular/core';
import { Item } from '@dream/game-board';

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

@Injectable({
  providedIn: 'root',
})
export class GameLoopStateService {
  readonly playerStats = signal<PlayerStats>({
    hp: 100,
    speed: 10,
    matrices: 100,
  });
  readonly backpackItems = signal<(Item | null)[]>(Array(1).fill(null));
  readonly equippedItems = signal<(Item | null)[]>(Array(5).fill(null));
  readonly backpackRows = signal<number>(1);
  readonly moveMode = signal<MoveMode | null>(null);

  resetRun(): void {
    this.playerStats.set({ hp: 100, speed: 10, matrices: 100 });
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
    if (this.playerStats().matrices >= 1) {
      this.deductMatrices(1);
      this.backpackItems.update((items) => [...items, null]);
    }
  }

  deductMatrices(amount: number): void {
    this.playerStats.update((stats) => ({
      ...stats,
      matrices: stats.matrices - amount,
    }));
  }
}
