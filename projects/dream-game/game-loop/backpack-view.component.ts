import { Component, computed, inject } from '@angular/core';
import { IconComponent, ItemDisplayComponent } from '@shared-ui';
import { ButtonComponent } from '../common/button.component';
import {
  GameLoopStateService,
  ForgedItemData,
  MoveMode,
  Position,
} from './game-loop-state.service';
import { InterfaceIconRegistry } from '../common/interface-icon-registry';
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
          Expand <app-icon [pathD]="matrixIconPath()" /> 1
        </app-button>
        <app-button
          data-testid="fight-btn"
          [variant]="'secondary'"
          (click)="fight()"
        >
          Fight <app-icon [pathD]="swordIconPath()" />
        </app-button>
      </div>
    </section>
  `,
  styleUrls: ['./backpack-view.component.scss'],
})
export class BackpackViewComponent {
  readonly service = inject(GameLoopStateService);

  readonly equippedItems = this.service.equippedItems;
  readonly backpackItems = this.service.backpackItems;
  readonly isMoveModeActive = computed(() => this.service.moveMode() !== null);
  readonly matrices = computed(() => this.service.playerStats().matrices);
  readonly matrixIconPath = computed(() =>
    InterfaceIconRegistry.resolveIconPath('matrices'),
  );
  readonly swordIconPath = computed(() =>
    InterfaceIconRegistry.resolveIconPath('sword'),
  );

  readonly canExpand = computed(() => this.matrices() >= 1);

  isSlotInMoveMode(area: 'equip' | 'backpack', index: number): boolean {
    const moveMode = this.service.moveMode();
    return (
      this.isMoveModeActive() &&
      moveMode?.fromArea === area &&
      moveMode?.fromIndex === index
    );
  }

  isSlotShaking(area: 'equip' | 'backpack', index: number): boolean {
    const shake = this.service.shakeSlot();
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

    const from = this.positionFromMoveMode(moveMode);
    const to = this.indexToPosition(area, index);

    this.service.moveItem(from, to);
    this.service.moveMode.set(null);
  }

  private canEquipToSlot(moveMode: MoveMode, targetSlotIndex: number): boolean {
    const sourceItem = this.getMoveSourceItem(moveMode);
    return this.service.canEquipToSlot(
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
        ? this.service.equippedItems()
        : this.service.backpackItems();
    return items[moveMode.fromIndex]!;
  }

  private triggerEquipShake(index: number, area: 'equip' | 'backpack'): void {
    this.service.triggerShake(area, index);
  }

  private positionFromMoveMode(moveMode: any): Position {
    return moveMode.fromArea === 'equip'
      ? { type: 'equipped' as const, slot: moveMode.fromIndex }
      : { type: 'backpack' as const, index: moveMode.fromIndex };
  }

  private indexToPosition(area: 'equip' | 'backpack', index: number): Position {
    return area === 'equip'
      ? { type: 'equipped' as const, slot: index }
      : { type: 'backpack' as const, index };
  }

  expandBackpack(): void {
    this.service.expandBackpack();
  }

  fight(): void {
    this.service.startFight();
  }
}
