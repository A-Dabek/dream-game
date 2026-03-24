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

@Injectable({
  providedIn: 'root',
})
export class GameLoopStateService {
  readonly playerStats = signal<PlayerStats>({
    hp: 100,
    speed: 10,
    matrices: 100,
  });
  readonly backpackItems = signal<(Item | null)[]>(Array(5).fill(null));
  readonly equippedItems = signal<(Item | null)[]>(Array(5).fill(null));
  readonly backpackRows = signal<number>(1);

  resetRun(): void {
    this.playerStats.set({ hp: 100, speed: 10, matrices: 100 });
    this.backpackItems.set(Array(5).fill(null));
    this.equippedItems.set(Array(5).fill(null));
    this.backpackRows.set(1);
  }

  addItemToBackpack(item: Item): void {
    const currentItems = this.backpackItems();
    const emptyIndex = currentItems.indexOf(null);
    if (emptyIndex !== -1) {
      currentItems[emptyIndex] = item;
      this.backpackItems.set([...currentItems]);
    }
  }

  moveItem(from: Position, to: Position): void {
    // TODO: Implement when needed
  }

  expandBackpack(): void {
    this.backpackRows.update((rows) => rows + 1);
  }

  deductMatrices(amount: number): void {
    this.playerStats.update((stats) => ({
      ...stats,
      matrices: stats.matrices - amount,
    }));
  }
}
