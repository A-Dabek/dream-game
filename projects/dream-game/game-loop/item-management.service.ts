import { Injectable, signal, computed, inject } from '@angular/core';
import { biasedRoll } from '@dream/game-board';
import { Item } from '@dream/shared-basic';
import {
  BASE_HP,
  BASE_SPEED,
  PlayerProgressService,
} from './player-progress.service';

export interface ForgedItemData {
  item: Item;
  stats: ItemBonusStats;
}

export interface ItemBonusStats {
  hp: number;
  speed: number;
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

export function forgeItemStats(): ItemBonusStats {
  const roll = biasedRoll();
  return { hp: roll, speed: 5 - roll };
}

@Injectable({
  providedIn: 'root',
})
export class ItemManagementService {
  private readonly playerProgress = inject(PlayerProgressService);

  readonly backpackItems = signal<(ForgedItemData | null)[]>(
    Array(5).fill(null),
  );
  readonly equippedItems = signal<(ForgedItemData | null)[]>(
    Array(5).fill(null),
  );
  readonly backpackRows = signal<number>(1);
  readonly shakeSlot = signal<{
    area: 'equip' | 'backpack';
    index: number;
  } | null>(null);

  readonly moveMode = signal<MoveMode | null>(null);

  readonly playerStats = computed(() => {
    const bonuses = this.equippedBonuses();
    return {
      hp: Math.max(1, BASE_HP + bonuses.bonusHp),
      speed: Math.max(1, BASE_SPEED + bonuses.bonusSpeed),
      matrices: this.playerProgress.matrices(),
    };
  });

  private equippedBonuses = computed(() => {
    return this.calculateEquippedBonuses(null);
  });

  reset(): void {
    this.backpackItems.set(Array(5).fill(null));
    this.equippedItems.set(Array(5).fill(null));
    this.backpackRows.set(1);
    this.shakeSlot.set(null);
    this.moveMode.set(null);
  }

  addItemToBackpack(forgedItem: ForgedItemData): void {
    const currentItems = this.backpackItems();
    const emptyIndex = currentItems.indexOf(null);
    if (emptyIndex !== -1) {
      currentItems[emptyIndex] = forgedItem;
      this.backpackItems.set([...currentItems]);
    }
  }

  onSlotClick(area: 'equip' | 'backpack', index: number): void {
    const items = area === 'equip' ? this.equippedItems : this.backpackItems;
    const itemData = items()[index];

    if (itemData && this.moveMode() === null) {
      this.startMove(area, index, itemData.item);
    } else if (this.moveMode() !== null) {
      this.completeMove(area, index);
    }
  }

  private startMove(
    area: 'equip' | 'backpack',
    index: number,
    item: Item,
  ): void {
    this.moveMode.set({
      active: true,
      item,
      fromArea: area,
      fromIndex: index,
    });
  }

  private completeMove(area: 'equip' | 'backpack', index: number): void {
    const moveMode = this.moveMode();
    if (!moveMode) return;

    if (area === 'equip' && !this.canEquipToSlotAt(moveMode, index)) {
      this.triggerShake(moveMode.fromArea, moveMode.fromIndex);
      this.moveMode.set(null);
      return;
    }

    if (moveMode.fromArea === 'equip' && !this.canUnequip(moveMode, area)) {
      this.triggerShake(moveMode.fromArea, moveMode.fromIndex);
      this.moveMode.set(null);
      return;
    }

    const from = this.toPosition(moveMode.fromArea, moveMode.fromIndex);
    const to = this.toPosition(area, index);

    this.moveItem(from, to);
    this.moveMode.set(null);
  }

  private canEquipToSlotAt(
    moveMode: MoveMode,
    targetSlotIndex: number,
  ): boolean {
    const sourceItem = this.getMoveSourceItem(moveMode);
    return this.canEquipToSlot(
      sourceItem.stats,
      moveMode.fromArea,
      moveMode.fromIndex,
      'equip',
      targetSlotIndex,
    );
  }

  private getMoveSourceItem(moveMode: MoveMode): ForgedItemData {
    const items =
      moveMode.fromArea === 'equip'
        ? this.equippedItems()
        : this.backpackItems();
    return items[moveMode.fromIndex]!;
  }

  private canUnequip(
    moveMode: MoveMode,
    targetArea: 'equip' | 'backpack',
  ): boolean {
    if (targetArea === 'equip') return true;
    return this.canUnequipItem(moveMode.fromIndex);
  }

  private toPosition(area: 'equip' | 'backpack', index: number): Position {
    return area === 'equip'
      ? { type: 'equipped', slot: index }
      : { type: 'backpack', index };
  }

  canEquipToSlot(
    sourceItemStats: ItemBonusStats,
    fromArea: 'equip' | 'backpack',
    fromIndex: number,
    targetArea: 'equip' | 'backpack',
    targetIndex: number,
  ): boolean {
    const equipped = this.equippedItems();
    let bonusHp = 0;
    let bonusSpeed = 0;

    const targetItem = targetArea === 'equip' ? equipped[targetIndex] : null;

    for (let i = 0; i < equipped.length; i++) {
      const item = equipped[i];
      if (!item) continue;
      if (fromArea === 'equip' && i === fromIndex) continue;
      if (targetArea === 'equip' && i === targetIndex) continue;
      bonusHp += item.stats.hp;
      bonusSpeed += item.stats.speed;
    }

    bonusHp += sourceItemStats.hp;
    bonusSpeed += sourceItemStats.speed;

    if (fromArea === 'equip' && targetItem) {
      bonusHp += targetItem.stats.hp;
      bonusSpeed += targetItem.stats.speed;
    }

    const resultingHp = BASE_HP + bonusHp;
    const resultingSpeed = BASE_SPEED + bonusSpeed;
    return resultingHp >= 1 && resultingSpeed >= 1;
  }

  canUnequipItem(equipSlotIndex: number): boolean {
    const equipped = this.equippedItems();
    if (!equipped[equipSlotIndex]) return true;

    const bonuses = this.calculateEquippedBonuses(equipSlotIndex);
    return (
      BASE_HP + bonuses.bonusHp >= 1 && BASE_SPEED + bonuses.bonusSpeed >= 1
    );
  }

  private calculateEquippedBonuses(excludeSlotIndex: number | null): {
    bonusHp: number;
    bonusSpeed: number;
  } {
    const equipped = this.equippedItems();
    let bonusHp = 0;
    let bonusSpeed = 0;
    for (let i = 0; i < equipped.length; i++) {
      if (i === excludeSlotIndex) continue;
      const item = equipped[i];
      if (item) {
        bonusHp += item.stats.hp;
        bonusSpeed += item.stats.speed;
      }
    }
    return { bonusHp, bonusSpeed };
  }

  moveItem(from: Position, to: Position): void {
    const itemToMove = this.getItemAt(from);
    if (itemToMove === null) {
      return;
    }

    const itemAtTarget = this.getItemAt(to);
    this.setItemAt(from, itemAtTarget);
    this.setItemAt(to, itemToMove);
  }

  getItemAt(position: Position): ForgedItemData | null {
    const items = this.getItemsForPosition(position);
    const index = position.type === 'backpack' ? position.index : position.slot;
    return items[index];
  }

  private setItemAt(position: Position, itemData: ForgedItemData | null): void {
    const itemsSignal =
      position.type === 'backpack' ? this.backpackItems : this.equippedItems;
    const index = position.type === 'backpack' ? position.index : position.slot;

    itemsSignal.update((items) => {
      const updated = [...items];
      updated[index] = itemData;
      return updated;
    });
  }

  private getItemsForPosition(
    position: Position,
  ): readonly (ForgedItemData | null)[] {
    return position.type === 'backpack'
      ? this.backpackItems()
      : this.equippedItems();
  }

  expandBackpack(): void {
    if (this.playerProgress.matrices() >= 1) {
      this.playerProgress.deductMatrices(1);
      this.backpackItems.update((items) => [...items, null]);
    }
  }

  triggerShake(area: 'equip' | 'backpack', index: number, resetMs = 450): void {
    this.shakeSlot.set({ area, index });
    setTimeout(() => {
      this.shakeSlot.set(null);
    }, resetMs);
  }
}
