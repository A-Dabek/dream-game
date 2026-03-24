import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IconComponent } from '../common/icon.component';
import { ButtonComponent } from '../common/button.component';
import { GameLoopStateService } from './game-loop-state.service';
import { InterfaceIconRegistry } from '../common/interface-icon-registry';
import { ItemConventionRegistry } from '@dream/game-board-ui';
import { ItemId } from '@dream/game-board';

// Basic items pool for forging (excluding blueprints)
const FORGE_ITEM_POOL: ItemId[] = [
  'hand',
  'punch',
  'sticking_plaster',
  'sticky_boot',
  'wingfoot',
];

// Icon placeholders for craft button
const CRAFT_ICON = 'arrow';
const COST_ICON = 'matrices';

// Craft cost in matrices
const CRAFT_COST = 2;

// Animation duration in milliseconds
const ANIMATION_DURATION_MS = 300;

interface ForgeItemDisplay {
  id: ItemId;
  name: string;
  description: string;
  hp: number;
  speed: number;
}

@Component({
  selector: 'app-forge-view',
  standalone: true,
  imports: [IconComponent, ButtonComponent],
  template: `
    <main class="forge-container">
      <article class="item-card" [class.animating]="isAnimating()">
        @if (craftedItem(); as item) {
          <div class="item-content">
            <app-icon [pathD]="itemIconPath()" class="item-icon" />
            <h2 class="item-name">{{ item.name }}</h2>
            <p class="item-description">{{ item.description }}</p>
            <div class="item-stats">
              <span class="stat hp">HP: {{ item.hp }}</span>
              <span class="stat speed">Speed: {{ item.speed }}</span>
            </div>
          </div>
        } @else {
          <span class="question-mark">?</span>
        }
      </article>

      <app-button
        class="craft-btn"
        [variant]="'secondary'"
        [disabled]="!canCraft()"
        (click)="craft()"
      >
        @if (hasBackpackSpace()) {
          <app-icon [pathD]="craftIconPath()" />
          Craft new item
          <app-icon [pathD]="costIconPath()" /> {{ this.CRAFT_COST }}
        } @else {
          Not enough space
        }
      </app-button>

      <app-button (click)="navigateToBackpack()">Proceed</app-button>
    </main>
  `,
  styleUrls: ['./forge-view.component.scss'],
})
export class ForgeViewComponent {
  private readonly router = inject(Router);
  private readonly service = inject(GameLoopStateService);

  // Expose constants to template
  readonly CRAFT_COST = CRAFT_COST;

  readonly isAnimating = signal(false);
  readonly craftedItem = signal<ForgeItemDisplay | null>(null);

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

  readonly costIconPath = computed(() =>
    InterfaceIconRegistry.resolveIconPath(COST_ICON),
  );

  readonly itemIconPath = computed(() => {
    const item = this.craftedItem();
    if (!item) {
      return '';
    }
    return ItemConventionRegistry.getItemDisplay(item.id).pathD;
  });

  craft(): void {
    if (!this.canCraft()) {
      return;
    }

    this.service.deductMatrices(CRAFT_COST);

    const itemId = this.getRandomItemId();
    const forgeItem = this.createForgeItemDisplay(itemId);

    this.isAnimating.set(true);

    setTimeout(() => {
      this.craftedItem.set(forgeItem);
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

  private createForgeItemDisplay(itemId: ItemId): ForgeItemDisplay {
    // Derive name and description from convention registry
    const convention = ItemConventionRegistry.getItemDisplay(itemId);
    const stats = FORGE_ITEM_STATS[itemId] ?? { hp: 0, speed: 0 };

    return {
      id: itemId,
      name: this.formatItemName(itemId),
      description: convention.description,
      hp: stats.hp,
      speed: stats.speed,
    };
  }

  private formatItemName(itemId: ItemId): string {
    // Convert item_id to Title Case: "sticking_plaster" -> "Sticking Plaster"
    return itemId
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

// Stats mapping for forge items (not available in convention registry)
const FORGE_ITEM_STATS: Partial<Record<ItemId, { hp: number; speed: number }>> =
  {
    hand: { hp: 0, speed: 0 },
    punch: { hp: 0, speed: 0 },
    sticking_plaster: { hp: 10, speed: 0 },
    sticky_boot: { hp: 0, speed: -2 },
    wingfoot: { hp: 0, speed: 5 },
  };
