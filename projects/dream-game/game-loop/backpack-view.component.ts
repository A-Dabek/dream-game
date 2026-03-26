import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgForOf, NgIf } from '@angular/common';
import { IconComponent, ItemDisplayComponent } from '@shared-ui';
import { ButtonComponent } from '../common/button.component';
import { GameLoopStateService, Position } from './game-loop-state.service';
import { InterfaceIconRegistry } from '../common/interface-icon-registry';
import { Item } from '@dream/game-board';

@Component({
  selector: 'app-backpack-view',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    IconComponent,
    ButtonComponent,
    ItemDisplayComponent,
  ],
  template: `
    <section class="equipment-section" data-testid="equipment-section">
      <div
        class="equip-slot"
        *ngFor="let item of equippedItems(); let i = index"
        [class.filled]="item !== null"
        [class.move-mode]="isSlotInMoveMode('equip', i)"
        (click)="onSlotClick('equip', i)"
        [attr.data-testid]="'equip-slot-' + i"
      >
        <app-item-display *ngIf="item" [item]="item" />
      </div>
    </section>

    <section class="backpack-section" data-testid="backpack-section">
      <div class="backpack-grid">
        <div
          class="backpack-slot"
          *ngFor="let item of backpackItems(); let i = index"
          [class.filled]="item !== null"
          [class.move-mode]="isSlotInMoveMode('backpack', i)"
          (click)="onSlotClick('backpack', i)"
          [attr.data-testid]="'backpack-slot-' + i"
        >
          <app-item-display *ngIf="item" [item]="item" />
        </div>
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
          data-testid="proceed-btn"
          [variant]="'secondary'"
          (click)="proceedToForge()"
        >
          Proceed <app-icon [pathD]="arrowIconPath()" />
        </app-button>
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
  readonly matrices = computed(() => this.service.playerStats().matrices);
  readonly matrixIconPath = computed(() =>
    InterfaceIconRegistry.resolveIconPath('matrices'),
  );
  readonly arrowIconPath = computed(() =>
    InterfaceIconRegistry.resolveIconPath('arrow'),
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
