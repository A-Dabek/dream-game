import { Component, computed, inject } from '@angular/core';
import { IconComponent, ItemDisplayComponent } from '@shared-ui';
import { ButtonComponent } from '../common/button.component';
import { MoveMode, Position, ForgedItemData } from './game-loop-state.service';
import { GameLoopStateService } from './game-loop-state.service';
import { ItemManagementService } from './item-management.service';
import { PlayerProgressService } from './player-progress.service';
import { resolveIcon } from '../common/interface-icon-registry';
import { Item } from '@dream/game-board';

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
            <app-item-display [item]="item.item" [stats]="item.stats" />
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
              <app-item-display [item]="item.item" [stats]="item.stats" />
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
          Expand <app-icon [pathD]="matrixIconPath" /> 1
        </app-button>
        <app-button
          data-testid="fight-btn"
          [variant]="'secondary'"
          (click)="service.startFight()"
        >
          Fight <app-icon [pathD]="swordIconPath" />
        </app-button>
      </div>
    </section>
  `,
  styleUrls: ['./backpack-view.component.scss'],
})
export class BackpackViewComponent {
  readonly service = inject(GameLoopStateService);
  private readonly itemManagement = inject(ItemManagementService);
  private readonly playerProgress = inject(PlayerProgressService);

  readonly equippedItems = this.itemManagement.equippedItems;
  readonly backpackItems = this.itemManagement.backpackItems;
  readonly matrixIconPath = resolveIcon('matrices');
  readonly swordIconPath = resolveIcon('sword');

  readonly canExpand = computed(() => this.playerProgress.matrices() >= 1);

  isSlotInMoveMode(area: 'equip' | 'backpack', index: number): boolean {
    const moveMode = this.service.moveMode();
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
    const items = area === 'equip' ? this.equippedItems : this.backpackItems;
    const itemData = items()[index];

    if (itemData && this.service.moveMode() === null) {
      this.startMove(area, index, itemData.item);
    } else if (this.service.moveMode() !== null) {
      this.completeMove(area, index);
    }
  }

  private startMove(
    area: 'equip' | 'backpack',
    index: number,
    item: Item,
  ): void {
    this.service.moveMode.set({
      active: true,
      item,
      fromArea: area,
      fromIndex: index,
    });
  }

  private completeMove(area: 'equip' | 'backpack', index: number): void {
    const moveMode = this.service.moveMode();
    if (!moveMode) return;

    if (area === 'equip' && !this.canEquipToSlot(moveMode, index)) {
      this.triggerEquipShake(moveMode.fromIndex, moveMode.fromArea);
      this.service.moveMode.set(null);
      return;
    }

    if (moveMode.fromArea === 'equip' && !this.canUnequip(moveMode, area)) {
      this.triggerEquipShake(moveMode.fromIndex, moveMode.fromArea);
      this.service.moveMode.set(null);
      return;
    }

    const from = this.toPosition(moveMode.fromArea, moveMode.fromIndex);
    const to = this.toPosition(area, index);

    this.itemManagement.moveItem(from, to);
    this.service.moveMode.set(null);
  }

  private canEquipToSlot(moveMode: MoveMode, targetSlotIndex: number): boolean {
    const sourceItem = this.getMoveSourceItem(moveMode);
    return this.itemManagement.canEquipToSlot(
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
        ? this.itemManagement.equippedItems()
        : this.itemManagement.backpackItems();
    return items[moveMode.fromIndex]!;
  }

  private canUnequip(
    moveMode: MoveMode,
    targetArea: 'equip' | 'backpack',
  ): boolean {
    // If dropping on another equip slot (swap), the stats change is handled by canEquipToSlot
    if (targetArea === 'equip') return true;
    return this.itemManagement.canUnequipItem(moveMode.fromIndex);
  }

  private triggerEquipShake(index: number, area: 'equip' | 'backpack'): void {
    this.itemManagement.triggerShake(area, index);
  }

  private toPosition(area: 'equip' | 'backpack', index: number): Position {
    return area === 'equip'
      ? { type: 'equipped', slot: index }
      : { type: 'backpack', index };
  }

  expandBackpack(): void {
    this.itemManagement.expandBackpack();
  }
}
