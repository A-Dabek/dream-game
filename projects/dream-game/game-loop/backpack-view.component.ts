import { Component, computed, inject } from '@angular/core';
import { IconComponent, ItemDisplayComponent, IconName } from '@shared-ui';
import { ItemConventionRegistry } from '@dream/game-board-ui';
import { ButtonComponent } from '../common/button.component';
import { GameLoopStateService } from './game-loop-state.service';
import { ItemManagementService } from './item-management.service';

@Component({
  selector: 'app-backpack-view',
  standalone: true,
  imports: [IconComponent, ButtonComponent, ItemDisplayComponent],
  template: `
    <section class="equipment-section" data-testid="equipment-section">
      @for (item of equippedItems(); track $index) {
        <div
          class="equip-slot"
          [class.filled]="item?.item !== null"
          [class.move-mode]="isSlotInMoveMode('equip', $index)"
          [class.shake]="isSlotShaking('equip', $index)"
          (click)="onSlotClick('equip', $index)"
          [attr.data-testid]="'equip-slot-' + $index"
        >
          @if (item) {
            <app-item-display
              [item]="item.item"
              [stats]="item.stats"
              [iconName]="getIcon(item.item.id)"
              [label]="getLabel(item.item.id)"
            />
          }
        </div>
      }
    </section>

    <section class="backpack-section" data-testid="backpack-section">
      <div class="backpack-grid">
        @for (item of backpackItems(); track $index) {
          <div
            class="backpack-slot"
            [class.filled]="item !== null"
            [class.move-mode]="isSlotInMoveMode('backpack', $index)"
            [class.shake]="isSlotShaking('backpack', $index)"
            (click)="onSlotClick('backpack', $index)"
            [attr.data-testid]="'backpack-slot-' + $index"
          >
            @if (item) {
              <app-item-display
                [item]="item.item"
                [stats]="item.stats"
                [iconName]="getIcon(item.item.id)"
                [label]="getLabel(item.item.id)"
              />
            }
          </div>
        }
      </div>

      <div class="footer-buttons">
        <app-button
          class="expand-btn"
          data-testid="expand-btn"
          [variant]="'secondary'"
          [disabled]="!canExpand()"
          (click)="expandBackpack()"
        >
          Expand
          <app-icon iconName="stack" />
          1
        </app-button>
        <app-button
          data-testid="fight-btn"
          [variant]="'secondary'"
          (click)="startFight()"
        >
          Fight
          <app-icon iconName="sword-clash" />
        </app-button>
      </div>
    </section>
  `,
  styleUrls: ['./backpack-view.component.scss'],
})
export class BackpackViewComponent {
  private readonly service = inject(GameLoopStateService);
  readonly canExpand = computed(() => this.service.playerStats().matrices >= 1);
  private readonly itemManagement = inject(ItemManagementService);
  readonly equippedItems = this.itemManagement.equippedItems;
  readonly backpackItems = this.itemManagement.backpackItems;

  isSlotInMoveMode(area: 'equip' | 'backpack', index: number): boolean {
    const moveMode = this.itemManagement.moveMode();
    return (
      moveMode !== null &&
      moveMode.fromArea === area &&
      moveMode.fromIndex === index
    );
  }

  isSlotShaking(area: 'equip' | 'backpack', index: number): boolean {
    const shake = this.itemManagement.shakeSlot();
    return shake !== null && shake.area === area && shake.index === index;
  }

  onSlotClick(area: 'equip' | 'backpack', index: number): void {
    this.itemManagement.onSlotClick(area, index);
  }

  expandBackpack(): void {
    this.itemManagement.expandBackpack();
  }

  startFight(): void {
    this.service.startFight();
  }

  protected getIcon(itemId: string): IconName {
    return ItemConventionRegistry.getItemConvention(itemId).icon as IconName;
  }

  protected getLabel(itemId: string): string {
    return ItemConventionRegistry.getItemConvention(itemId).name;
  }
}
