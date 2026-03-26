import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IconComponent } from '@shared-ui';
import { ButtonComponent } from '../common/button.component';
import {
  GameLoopStateService,
  getItemBonusStats,
} from './game-loop-state.service';
import { InterfaceIconRegistry } from '../common/interface-icon-registry';
import { ItemCardComponent, ItemStats } from '@dream/game-board-ui';
import { ItemId } from '@dream/game-board';

// Basic items pool for forging (excluding blueprints)
const FORGE_ITEM_POOL: ItemId[] = [
  'hand',
  'punch',
  'sticking_plaster',
  'sticky_boot',
  'wingfoot',
];

// Icon names
const CRAFT_ICON = 'arrow';
const COST_ICON = 'matrices';

// Craft cost in matrices
const CRAFT_COST = 2;

// Animation duration in milliseconds
const ANIMATION_DURATION_MS = 300;

@Component({
  selector: 'app-forge-view',
  standalone: true,
  imports: [IconComponent, ButtonComponent, ItemCardComponent],
  template: `
    <main class="forge-container" data-testid="forge-container">
      <div
        class="card-wrapper"
        [class.animating]="isAnimating()"
        data-testid="card-wrapper"
      >
        @if (craftedItem(); as item) {
          <app-item-card [itemId]="item.id" [stats]="itemStats(item.id)" />
        } @else {
          <div class="empty-card" data-testid="empty-card">
            <span class="question-mark">?</span>
          </div>
        }
      </div>

      <app-button
        class="craft-btn"
        data-testid="craft-btn"
        [variant]="'secondary'"
        [disabled]="!canCraft()"
        (click)="craft()"
      >
        @if (hasBackpackSpace()) {
          <app-icon [pathD]="craftIconPath()" />
          Craft new item
          <app-icon [pathD]="costIconPath()" /> {{ CRAFT_COST }}
        } @else {
          Not enough space
        }
      </app-button>

      <app-button
        class="proceed-btn"
        data-testid="proceed-btn"
        [variant]="'secondary'"
        (click)="navigateToBackpack()"
        >Proceed <app-icon [pathD]="arrowIconPath()"
      /></app-button>
    </main>
  `,
  styleUrls: ['./forge-view.component.scss'],
})
export class ForgeViewComponent {
  private readonly router = inject(Router);
  private readonly service = inject(GameLoopStateService);

  // Expose constant to template
  readonly CRAFT_COST = CRAFT_COST;

  readonly isAnimating = signal(false);
  readonly craftedItem = signal<{ id: ItemId } | null>(null);

  readonly matrices = computed(() => this.service.playerStats().matrices);

  readonly hasBackpackSpace = computed(() => {
    const items = this.service.backpackItems();
    return items.some((item) => item === null);
  });

  readonly canCraft = computed(
    () =>
      this.matrices() >= CRAFT_COST &&
      this.hasBackpackSpace() &&
      !this.isAnimating(),
  );

  readonly craftIconPath = computed(() =>
    InterfaceIconRegistry.resolveIconPath(CRAFT_ICON),
  );

  readonly arrowIconPath = computed(() =>
    InterfaceIconRegistry.resolveIconPath('arrow'),
  );

  readonly costIconPath = computed(() =>
    InterfaceIconRegistry.resolveIconPath(COST_ICON),
  );

  itemStats(itemId: ItemId): ItemStats {
    return getItemBonusStats(itemId);
  }

  craft(): void {
    if (!this.canCraft()) {
      return;
    }

    this.service.deductMatrices(CRAFT_COST);

    const itemId = this.getRandomItemId();

    this.isAnimating.set(true);

    setTimeout(() => {
      this.craftedItem.set({ id: itemId });
      this.isAnimating.set(false);

      this.service.addItemToBackpack({
        id: itemId,
        genre: 'basic',
      });
    }, ANIMATION_DURATION_MS);
  }

  navigateToBackpack(): void {
    this.router.navigate(['game-loop', 'backpack']);
  }

  private getRandomItemId(): ItemId {
    const randomIndex = Math.floor(Math.random() * FORGE_ITEM_POOL.length);
    return FORGE_ITEM_POOL[randomIndex];
  }
}
