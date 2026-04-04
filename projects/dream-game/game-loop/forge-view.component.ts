import { Component, computed, inject, signal } from '@angular/core';
import { IconComponent } from '@shared-ui';
import { ButtonComponent } from '../common/button.component';
import {
  GameLoopStateService,
  ForgedItemData,
  forgeItemStats,
} from './game-loop-state.service';
import { InterfaceIconRegistry } from '../common/interface-icon-registry';
import { ItemCardComponent } from '@dream/game-board-ui';
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
        @if (craftedItem(); as itemData) {
          <app-item-card [itemId]="itemData.item.id" [stats]="itemData.stats" />
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
        class="fight-btn"
        data-testid="fight-btn"
        [variant]="'secondary'"
        (click)="fight()"
        >Fight <app-icon [pathD]="swordIconPath()"
      /></app-button>
    </main>
  `,
  styleUrls: ['./forge-view.component.scss'],
})
export class ForgeViewComponent {
  private readonly service = inject(GameLoopStateService);

  // Expose constant to template
  readonly CRAFT_COST = CRAFT_COST;

  readonly isAnimating = signal(false);
  readonly craftedItem = signal<ForgedItemData | null>(null);

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

  readonly swordIconPath = computed(() =>
    InterfaceIconRegistry.resolveIconPath('sword'),
  );

  readonly costIconPath = computed(() =>
    InterfaceIconRegistry.resolveIconPath(COST_ICON),
  );

  craft(): void {
    if (!this.canCraft()) {
      return;
    }

    this.service.deductMatrices(CRAFT_COST);

    const itemId = this.getRandomItemId();
    const stats = forgeItemStats();

    this.isAnimating.set(true);

    setTimeout(() => {
      const item = { id: itemId, genre: 'basic' as const, remainingUsages: 1 };
      const forgedItem = { item, stats };

      this.craftedItem.set(forgedItem);
      this.isAnimating.set(false);

      this.service.addItemToBackpack(forgedItem);
    }, ANIMATION_DURATION_MS);
  }

  fight(): void {
    this.service.startFight();
  }

  private getRandomItemId(): ItemId {
    const randomIndex = Math.floor(Math.random() * FORGE_ITEM_POOL.length);
    return FORGE_ITEM_POOL[randomIndex];
  }
}
