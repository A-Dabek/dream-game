import { Component, inject } from '@angular/core';
import { IconComponent } from '@shared-ui';
import { ButtonComponent } from '../common/button.component';
import { GameLoopStateService } from './game-loop-state.service';
import { resolveIcon } from '../common/interface-icon-registry';
import { ItemCardComponent } from '@dream/game-board-ui';
import { ForgeService, CRAFT_COST } from './forge.service';

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
          <app-icon [pathD]="craftIconPath" />
          Craft new item
          <app-icon [pathD]="costIconPath" /> {{ CRAFT_COST }}
        } @else {
          Not enough space
        }
      </app-button>

      <app-button
        class="fight-btn"
        data-testid="fight-btn"
        [variant]="'secondary'"
        (click)="startFight()"
        >Fight <app-icon [pathD]="swordIconPath"
      /></app-button>
    </main>
  `,
  styleUrls: ['./forge-view.component.scss'],
})
export class ForgeViewComponent {
  private readonly service = inject(GameLoopStateService);
  private readonly forgeService = inject(ForgeService);

  readonly CRAFT_COST = CRAFT_COST;

  readonly isAnimating = this.forgeService.isAnimating;
  readonly craftedItem = this.forgeService.craftedItem;
  readonly canCraft = this.forgeService.canCraft;
  readonly hasBackpackSpace = this.forgeService.hasBackpackSpace;

  readonly craftIconPath = resolveIcon('arrow');
  readonly swordIconPath = resolveIcon('sword');
  readonly costIconPath = resolveIcon('matrices');

  craft(): void {
    this.forgeService.craft();
  }

  startFight(): void {
    this.service.startFight();
  }
}
