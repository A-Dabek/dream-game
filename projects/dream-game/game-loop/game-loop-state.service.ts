import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { biasedRoll, Item } from '@dream/game-board';
import { CampaignService, EnemyConfig } from './campaign.service';

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

export interface ForgedItemData {
  item: Item;
  stats: ItemBonusStats;
}

// Base stats - player starts with these
export const BASE_HP = 1;
export const BASE_SPEED = 1;
const BASE_MATRICES = 10;

export interface ItemBonusStats {
  hp: number;
  speed: number;
}

export function forgeItemStats(): ItemBonusStats {
  const roll = biasedRoll();
  return { hp: roll, speed: 5 - roll };
}

@Injectable({
  providedIn: 'root',
})
export class GameLoopStateService {
  private readonly router = inject(Router);
  private readonly campaignService = inject(CampaignService);

  readonly matrices = signal(BASE_MATRICES);

  readonly backpackItems = signal<(ForgedItemData | null)[]>(
    Array(1).fill(null),
  );
  readonly equippedItems = signal<(ForgedItemData | null)[]>(
    Array(5).fill(null),
  );
  readonly backpackRows = signal<number>(1);
  readonly moveMode = signal<MoveMode | null>(null);
  readonly currentEnemy = signal<EnemyConfig | null>(null);

  // Computed stats based on base + equipped items
  readonly playerStats = computed<PlayerStats>(() => {
    const bonuses = this.equippedBonuses();
    return {
      hp: Math.max(1, BASE_HP + bonuses.bonusHp),
      speed: Math.max(1, BASE_SPEED + bonuses.bonusSpeed),
      matrices: this.matrices(),
    };
  });

  private equippedBonuses = computed(() => {
    return this.calculateEquippedBonuses(null);
  });

  resetRun(): void {
    this.matrices.set(BASE_MATRICES);
    this.backpackItems.set(Array(1).fill(null));
    this.equippedItems.set(Array(5).fill(null));
    this.backpackRows.set(1);
    this.moveMode.set(null);
    this.currentEnemy.set(null);
  }

  addItemToBackpack(forgedItem: ForgedItemData): void {
    const currentItems = this.backpackItems();
    const emptyIndex = currentItems.indexOf(null);
    if (emptyIndex !== -1) {
      currentItems[emptyIndex] = forgedItem;
      this.backpackItems.set([...currentItems]);
    } else {
      // If no empty slot, perhaps expand, but for now, do nothing
    }
  }

  readonly shakeSlot = signal<{
    area: 'equip' | 'backpack';
    index: number;
  } | null>(null);

  triggerShake(area: 'equip' | 'backpack', index: number, resetMs = 450): void {
    this.shakeSlot.set({ area, index });
    setTimeout(() => {
      this.shakeSlot.set(null);
    }, resetMs);
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

    // Capture the target item's stats before the loop (for equip-to-equip swaps)
    const targetItem = targetArea === 'equip' ? equipped[targetIndex] : null;

    // Calculate what bonuses the equip slots would have AFTER the swap
    for (let i = 0; i < equipped.length; i++) {
      const item = equipped[i];
      if (!item) continue;
      // Skip the source slot (item being moved away)
      if (fromArea === 'equip' && i === fromIndex) continue;
      // Skip the target slot — for equip targets it moves to source slot,
      // so we must not count it here (handled below)
      if (targetArea === 'equip' && i === targetIndex) continue;
      bonusHp += item.stats.hp;
      bonusSpeed += item.stats.speed;
    }

    // Add the source item's contribution (it goes to the target slot)
    bonusHp += sourceItemStats.hp;
    bonusSpeed += sourceItemStats.speed;

    // For equip-to-equip swaps, the target item moves to the source slot
    // so its stats also stay in the equipped pool
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
    if (this.matrices() >= 1) {
      this.deductMatrices(1);
      this.backpackItems.update((items) => [...items, null]);
    }
  }

  deductMatrices(amount: number): void {
    this.matrices.update((value) => value - amount);
  }

  setEnemy(config: EnemyConfig): void {
    this.currentEnemy.set(config);
  }

  buildFightState(): string | null {
    const enemy = this.currentEnemy();
    if (!enemy) {
      return null;
    }

    const equipped = this.equippedItems();
    const itemIds = equipped
      .filter((item): item is ForgedItemData => item !== null)
      .map((item) => item.item.id)
      .join(',');
    const stats = this.playerStats();

    const playerConfig = `${itemIds}|${stats.hp}|${stats.speed}`;
    const enemyConfig = `${enemy.items}|${enemy.health}|${enemy.speed}`;

    return `${playerConfig};${enemyConfig}`;
  }

  async startFight(): Promise<void> {
    try {
      await this.campaignService.loadEnemies();
    } catch {
      console.error('[GameLoopState] Failed to load enemies');
      return;
    }

    const enemy = this.campaignService.getNextEnemy();
    if (!enemy) {
      console.error('[GameLoopState] No enemy available');
      return;
    }

    this.setEnemy(enemy);
    const state = this.buildFightState();

    if (state) {
      this.router.navigate(['/'], { queryParams: { state } });
    }
  }
}
