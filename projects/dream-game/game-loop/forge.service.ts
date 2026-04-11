import { Injectable, computed, inject, signal } from '@angular/core';
import { ItemId } from '@dream/game-board';
import {
  ForgedItemData,
  forgeItemStats,
  ItemManagementService,
} from './item-management.service';
import { PlayerProgressService } from './player-progress.service';

// Basic items pool for forging (excluding blueprints)
const FORGE_ITEM_POOL: ItemId[] = [
  'hand',
  'punch',
  'sticking_plaster',
  'sticky_boot',
  'wingfoot',
];

// Craft cost in matrices
export const CRAFT_COST = 2;

// Animation duration in milliseconds
export const ANIMATION_DURATION_MS = 300;

@Injectable({
  providedIn: 'root',
})
export class ForgeService {
  private readonly itemManagement = inject(ItemManagementService);
  private readonly playerProgress = inject(PlayerProgressService);

  readonly isAnimating = signal(false);
  readonly craftedItem = signal<ForgedItemData | null>(null);

  readonly hasBackpackSpace = computed(() => {
    const items = this.itemManagement.backpackItems();
    return items.some((item) => item === null);
  });

  readonly canCraft = computed(
    () =>
      this.playerProgress.matrices() >= CRAFT_COST &&
      this.hasBackpackSpace() &&
      !this.isAnimating(),
  );

  craft(): void {
    if (!this.canCraft()) {
      return;
    }

    this.playerProgress.deductMatrices(CRAFT_COST);

    const itemId = this.getRandomItemId();
    const stats = forgeItemStats();

    this.isAnimating.set(true);

    setTimeout(() => {
      const item = { id: itemId, genre: 'basic' as const, remainingUsages: 1 };
      const forgedItem = { item, stats };

      this.craftedItem.set(forgedItem);
      this.isAnimating.set(false);

      this.itemManagement.addItemToBackpack(forgedItem);
    }, ANIMATION_DURATION_MS);
  }

  private getRandomItemId(): ItemId {
    const randomIndex = Math.floor(Math.random() * FORGE_ITEM_POOL.length);
    return FORGE_ITEM_POOL[randomIndex];
  }
}
