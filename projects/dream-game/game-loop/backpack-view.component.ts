import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgForOf, NgIf } from '@angular/common';
import { IconComponent } from '../common/icon.component';
import { ItemDisplayComponent } from './item-display.component';
import { GameLoopStateService, Position } from './game-loop-state.service';
import { InterfaceIconRegistry } from '../common/interface-icon-registry';

@Component({
  selector: 'app-backpack-view',
  standalone: true,
  imports: [NgForOf, NgIf, IconComponent, ItemDisplayComponent],
  template: `
    <section class="equipment-section">
      <div
        class="equip-slot"
        *ngFor="let item of equippedItems(); let i = index"
        [class.filled]="item !== null"
        [class.move-mode]="isSlotInMoveMode('equip', i)"
        (click)="onSlotClick('equip', i)"
      >
        <app-item-display *ngIf="item" [item]="item" />
      </div>
    </section>

    <button class="expand-btn" (click)="expandBackpack()">
      Expand <app-icon [pathD]="matrixIconPath()" /> 1
    </button>

    <section class="backpack-section">
      <div class="backpack-grid">
        <div
          class="backpack-slot"
          *ngFor="let item of backpackItems(); let i = index"
          [class.filled]="item !== null"
          [class.move-mode]="isSlotInMoveMode('backpack', i)"
          (click)="onSlotClick('backpack', i)"
        >
          <app-item-display *ngIf="item" [item]="item" />
        </div>
      </div>

      <div class="footer-buttons">
        <button class="proceed-btn" (click)="proceedToForge()">Proceed</button>
      </div>
    </section>
  `,
  styleUrls: ['./backpack-view.component.scss'],
})
export class BackpackViewComponent {
  readonly router = inject(Router);
  readonly service = inject(GameLoopStateService);

  readonly equippedItems = this.service.equippedItems;
  readonly backpackItems = this.service.backpackItems;
  readonly isMoveModeActive = computed(() => this.service.moveMode() !== null);
  readonly matrixIconPath = computed(() =>
    InterfaceIconRegistry.resolveIconPath('matrices'),
  );

  isSlotInMoveMode(area: 'equip' | 'backpack', index: number): boolean {
    const moveMode = this.service.moveMode();
    return (
      this.isMoveModeActive() &&
      moveMode?.fromArea === area &&
      moveMode?.fromIndex === index
    );
  }

  onSlotClick(area: 'equip' | 'backpack', index: number): void {
    const items = area === 'equip' ? this.equippedItems : this.backpackItems;
    const item = items()[index];

    if (item && this.service.moveMode() === null) {
      this.startMove(area, index, item);
    } else if (this.service.moveMode() !== null) {
      this.completeMove(area, index);
    }
  }

  private startMove(
    area: 'equip' | 'backpack',
    index: number,
    item: any,
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

    const from = this.positionFromMoveMode(moveMode);
    const to = this.indexToPosition(area, index);

    this.service.moveItem(from, to);
    this.service.moveMode.set(null);
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

  proceedToForge(): void {
    this.router.navigate(['game-loop', 'forge']);
  }
}
