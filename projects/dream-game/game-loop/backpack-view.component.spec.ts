import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Item } from '@dream/shared-basic';
import { beforeEach, describe, expect, it } from 'vitest';
import { BackpackViewComponent } from './backpack-view.component';
import {
  GameLoopStateService,
  ForgedItemData,
} from './game-loop-state.service';
import { ItemManagementService } from './item-management.service';
import { PlayerProgressService } from './player-progress.service';
import { FightManagerService } from './fight-manager.service';
import { ItemId } from '@dream/game-board';
import { IconComponent } from '@shared-ui';
import { ButtonComponent } from '../common/button.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

function createForgedItem(
  id: ItemId,
  stats: { hp: number; speed: number },
): ForgedItemData {
  return {
    item: { id, genre: 'basic', remainingUsages: 1 } as Item,
    stats,
  };
}

describe('BackpackViewComponent', () => {
  let fixture: ComponentFixture<BackpackViewComponent>;
  let itemManagement: ItemManagementService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BackpackViewComponent,
        IconComponent,
        ButtonComponent,
        RouterTestingModule,
        HttpClientTestingModule,
      ],
      providers: [
        GameLoopStateService,
        ItemManagementService,
        PlayerProgressService,
        FightManagerService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BackpackViewComponent);
    itemManagement = TestBed.inject(ItemManagementService);
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render 5 equip slots', () => {
    fixture.detectChanges();
    const slots = fixture.nativeElement.querySelectorAll(
      '[data-testid^="equip-slot-"]',
    );
    expect(slots.length).toBe(5);
  });

  it('should render equip slots as empty when no items equipped', () => {
    fixture.detectChanges();
    const slots = fixture.nativeElement.querySelectorAll(
      '.equip-slot:not(.filled)',
    );
    expect(slots.length).toBe(5);
  });

  it('should show equipped items in slots', () => {
    const item = createForgedItem('sticking_plaster', { hp: 2, speed: 3 });
    itemManagement.equippedItems.set([item, null, null, null, null]);

    fixture.detectChanges();

    const filledSlot =
      fixture.nativeElement.querySelector('.equip-slot.filled');
    expect(filledSlot).toBeTruthy();
    expect(filledSlot.getAttribute('data-testid')).toBe('equip-slot-0');
  });

  it('should start move mode when clicking an item', () => {
    const item = createForgedItem('sticking_plaster', { hp: 2, speed: 3 });
    itemManagement.backpackItems.set([item, null]);

    fixture.detectChanges();
    const firstSlot = fixture.nativeElement.querySelector(
      '[data-testid="backpack-slot-0"]',
    );
    firstSlot.click();

    expect(itemManagement.moveMode()).toBeTruthy();
    expect(itemManagement.moveMode()!.fromArea).toBe('backpack');
    expect(itemManagement.moveMode()!.fromIndex).toBe(0);
  });

  it('should complete move when clicking an empty slot while in move mode', () => {
    const item = createForgedItem('sticking_plaster', { hp: 2, speed: 3 });
    itemManagement.backpackItems.set([item, null]);

    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('[data-testid="backpack-slot-0"]')
      .click(); // start move
    fixture.nativeElement
      .querySelector('[data-testid="backpack-slot-1"]')
      .click(); // complete

    expect(itemManagement.backpackItems()[0]).toBeNull();
    expect(itemManagement.backpackItems()[1]).toBe(item);
  });

  it('should swap items when clicking a filled slot while in move mode', () => {
    const itemA = createForgedItem('sticking_plaster', { hp: 1, speed: 4 });
    const itemB = createForgedItem('wingfoot', { hp: 4, speed: 1 });
    itemManagement.backpackItems.set([itemA, itemB]);

    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('[data-testid="backpack-slot-0"]')
      .click(); // pick up itemA
    fixture.nativeElement
      .querySelector('[data-testid="backpack-slot-1"]')
      .click(); // drop on itemB

    expect(itemManagement.backpackItems()[0]).toBe(itemB);
    expect(itemManagement.backpackItems()[1]).toBe(itemA);
  });

  it('should shake source backpack slot when equip validation fails', () => {
    const negativeItem = createForgedItem('sticking_plaster', {
      hp: -10,
      speed: -10,
    });
    itemManagement.backpackItems.set([negativeItem, null]);

    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('[data-testid="backpack-slot-0"]')
      .click(); // pick up item
    fixture.nativeElement.querySelector('[data-testid="equip-slot-0"]').click(); // try to equip

    const shakingSlot = itemManagement.shakeSlot();
    expect(shakingSlot).toEqual({ area: 'backpack', index: 0 });
    expect(itemManagement.moveMode()).toBeNull(); // move mode should be cleared
  });

  it('should shake source backpack slot when trying to replace with invalid item', () => {
    // Fill all 5 equip slots with the same negative item so total stats stay clamped but at base
    const negativeItem = createForgedItem('sticking_plaster', {
      hp: -1,
      speed: 0,
    });
    itemManagement.equippedItems.set([
      negativeItem,
      negativeItem,
      negativeItem,
      negativeItem,
      negativeItem,
    ]);

    // Try to replace slot 4 with a heavily negative item
    const veryNegativeItem = createForgedItem('wingfoot', {
      hp: -10,
      speed: 0,
    });
    itemManagement.backpackItems.set([veryNegativeItem]);

    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('[data-testid="backpack-slot-0"]')
      .click(); // pick up
    fixture.nativeElement.querySelector('[data-testid="equip-slot-4"]').click(); // drop on equip slot 4

    const shakingSlot = itemManagement.shakeSlot();
    expect(shakingSlot).toEqual({ area: 'backpack', index: 0 });
    // Item should still be in backpack
    expect(itemManagement.backpackItems()[0]).toBe(veryNegativeItem);
  });

  it('should allow equipping positive-stat item to empty equip slot', () => {
    const positiveItem = createForgedItem('sticking_plaster', {
      hp: 3,
      speed: 2,
    });
    itemManagement.backpackItems.set([positiveItem, null]);

    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('[data-testid="backpack-slot-0"]')
      .click(); // pick up
    fixture.nativeElement.querySelector('[data-testid="equip-slot-0"]').click(); // drop on equip slot 0

    expect(itemManagement.equippedItems()[0]).toBe(positiveItem);
    expect(itemManagement.backpackItems()[0]).toBeNull();
    expect(itemManagement.shakeSlot()).toBeNull(); // no shake on success
  });

  it('should reject equipping item that drops speed below 1', () => {
    const item = createForgedItem('sticking_plaster', { hp: 0, speed: -10 });
    itemManagement.backpackItems.set([item, null]);

    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('[data-testid="backpack-slot-0"]')
      .click();
    fixture.nativeElement.querySelector('[data-testid="equip-slot-0"]').click();

    expect(itemManagement.shakeSlot()).toEqual({ area: 'backpack', index: 0 });
    expect(itemManagement.backpackItems()[0]).toBe(item); // item stays in backpack
  });

  it('should swap equip slot items when both items stay valid', () => {
    const itemA = createForgedItem('sticking_plaster', { hp: 2, speed: -1 });
    const itemB = createForgedItem('wingfoot', { hp: -1, speed: 2 });
    itemManagement.equippedItems.set([itemA, itemB, null, null, null]);

    fixture.detectChanges();
    fixture.nativeElement.querySelector('[data-testid="equip-slot-0"]').click(); // pick up itemA
    fixture.nativeElement.querySelector('[data-testid="equip-slot-1"]').click(); // drop on itemB

    expect(itemManagement.equippedItems()[0]).toBe(itemB);
    expect(itemManagement.equippedItems()[1]).toBe(itemA);
    expect(itemManagement.shakeSlot()).toBeNull();
  });

  it('should move equipped item to backpack when clicking backpack slot', () => {
    const item = createForgedItem('sticking_plaster', { hp: 3, speed: 2 });
    itemManagement.equippedItems.set([item, null, null, null, null]);
    itemManagement.backpackItems.set([null, null]);

    fixture.detectChanges();
    fixture.nativeElement.querySelector('[data-testid="equip-slot-0"]').click(); // pick up
    fixture.nativeElement
      .querySelector('[data-testid="backpack-slot-0"]')
      .click(); // drop

    expect(itemManagement.equippedItems()[0]).toBeNull();
    expect(itemManagement.backpackItems()[0]).toBe(item);
    expect(itemManagement.shakeSlot()).toBeNull();
  });

  it('should swap equipped item with backpack item', () => {
    const equippedItem = createForgedItem('sticking_plaster', {
      hp: 3,
      speed: 2,
    });
    const backpackItem = createForgedItem('wingfoot', { hp: 1, speed: 1 });
    itemManagement.equippedItems.set([equippedItem, null, null, null, null]);
    itemManagement.backpackItems.set([backpackItem, null]);

    fixture.detectChanges();
    fixture.nativeElement.querySelector('[data-testid="equip-slot-0"]').click(); // pick up equippedItem
    fixture.nativeElement
      .querySelector('[data-testid="backpack-slot-0"]')
      .click(); // drop on backpackItem

    expect(itemManagement.equippedItems()[0]).toBe(backpackItem);
    expect(itemManagement.backpackItems()[0]).toBe(equippedItem);
  });
});
