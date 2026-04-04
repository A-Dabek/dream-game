import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { BackpackViewComponent } from './backpack-view.component';
import {
  GameLoopStateService,
  ForgedItemData,
} from './game-loop-state.service';
import { Item, ItemId } from '@dream/game-board';
import { IconComponent } from '@shared-ui';
import { ButtonComponent } from '../common/button.component';
import { RouterTestingModule } from '@angular/router/testing';

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
  let service: GameLoopStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BackpackViewComponent,
        IconComponent,
        ButtonComponent,
        RouterTestingModule,
      ],
      providers: [GameLoopStateService],
    }).compileComponents();

    fixture = TestBed.createComponent(BackpackViewComponent);
    service = TestBed.inject(GameLoopStateService);
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
    service.equippedItems.set([item, null, null, null, null]);

    fixture.detectChanges();

    const filledSlot =
      fixture.nativeElement.querySelector('.equip-slot.filled');
    expect(filledSlot).toBeTruthy();
    expect(filledSlot.getAttribute('data-testid')).toBe('equip-slot-0');
  });

  it('should start move mode when clicking an item', () => {
    const item = createForgedItem('sticking_plaster', { hp: 2, speed: 3 });
    service.backpackItems.set([item, null]);

    fixture.detectChanges();
    const firstSlot = fixture.nativeElement.querySelector(
      '[data-testid="backpack-slot-0"]',
    );
    firstSlot.click();

    expect(service.moveMode()).toBeTruthy();
    expect(service.moveMode()!.fromArea).toBe('backpack');
    expect(service.moveMode()!.fromIndex).toBe(0);
  });

  it('should complete move when clicking an empty slot while in move mode', () => {
    const item = createForgedItem('sticking_plaster', { hp: 2, speed: 3 });
    service.backpackItems.set([item, null]);

    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('[data-testid="backpack-slot-0"]')
      .click(); // start move
    fixture.nativeElement
      .querySelector('[data-testid="backpack-slot-1"]')
      .click(); // complete

    expect(service.backpackItems()[0]).toBeNull();
    expect(service.backpackItems()[1]).toBe(item);
  });

  it('should swap items when clicking a filled slot while in move mode', () => {
    const itemA = createForgedItem('sticking_plaster', { hp: 1, speed: 4 });
    const itemB = createForgedItem('wingfoot', { hp: 4, speed: 1 });
    service.backpackItems.set([itemA, itemB]);

    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('[data-testid="backpack-slot-0"]')
      .click(); // pick up itemA
    fixture.nativeElement
      .querySelector('[data-testid="backpack-slot-1"]')
      .click(); // drop on itemB

    expect(service.backpackItems()[0]).toBe(itemB);
    expect(service.backpackItems()[1]).toBe(itemA);
  });

  it('should shake source backpack slot when equip validation fails', () => {
    const negativeItem = createForgedItem('sticking_plaster', {
      hp: -10,
      speed: -10,
    });
    service.backpackItems.set([negativeItem, null]);

    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('[data-testid="backpack-slot-0"]')
      .click(); // pick up item
    fixture.nativeElement.querySelector('[data-testid="equip-slot-0"]').click(); // try to equip

    const shakingSlot = service.shakeSlot();
    expect(shakingSlot).toEqual({ area: 'backpack', index: 0 });
    expect(service.moveMode()).toBeNull(); // move mode should be cleared
  });

  it('should shake source equip slot when trying to replace with invalid item', () => {
    // Fill all 5 equip slots with the same negative item so total stats stay clamped but at base
    const negativeItem = createForgedItem('sticking_plaster', {
      hp: -1,
      speed: 0,
    });
    service.equippedItems.set([
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
    service.backpackItems.set([veryNegativeItem]);

    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('[data-testid="backpack-slot-0"]')
      .click(); // pick up
    fixture.nativeElement.querySelector('[data-testid="equip-slot-4"]').click(); // drop on equip slot 4

    const shakingSlot = service.shakeSlot();
    expect(shakingSlot).toEqual({ area: 'backpack', index: 0 });
    // Item should still be in backpack
    expect(service.backpackItems()[0]).toBe(veryNegativeItem);
  });

  it('should allow equipping positive-stat item to empty equip slot', () => {
    const positiveItem = createForgedItem('sticking_plaster', {
      hp: 3,
      speed: 2,
    });
    service.backpackItems.set([positiveItem, null]);

    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('[data-testid="backpack-slot-0"]')
      .click(); // pick up
    fixture.nativeElement.querySelector('[data-testid="equip-slot-0"]').click(); // drop on equip slot 0

    expect(service.equippedItems()[0]).toBe(positiveItem);
    expect(service.backpackItems()[0]).toBeNull();
    expect(service.shakeSlot()).toBeNull(); // no shake on success
  });

  it('should reject equipping item that drops speed below 1', () => {
    const item = createForgedItem('sticking_plaster', { hp: 0, speed: -10 });
    service.backpackItems.set([item, null]);

    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('[data-testid="backpack-slot-0"]')
      .click();
    fixture.nativeElement.querySelector('[data-testid="equip-slot-0"]').click();

    expect(service.shakeSlot()).toEqual({ area: 'backpack', index: 0 });
    expect(service.backpackItems()[0]).toBe(item); // item stays in backpack
  });

  it('should swap equip slot items when both items stay valid', () => {
    const itemA = createForgedItem('sticking_plaster', { hp: 2, speed: -1 });
    const itemB = createForgedItem('wingfoot', { hp: -1, speed: 2 });
    service.equippedItems.set([itemA, itemB, null, null, null]);

    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('[data-testid="equip-slot-0"]')
      .click(); // pick up itemA
    fixture.nativeElement
      .querySelector('[data-testid="equip-slot-1"]')
      .click(); // drop on itemB

    expect(service.equippedItems()[0]).toBe(itemB);
    expect(service.equippedItems()[1]).toBe(itemA);
    expect(service.shakeSlot()).toBeNull();
  });

  it('should move equipped item to backpack when clicking backpack slot', () => {
    const item = createForgedItem('sticking_plaster', { hp: 3, speed: 2 });
    service.equippedItems.set([item, null, null, null, null]);
    service.backpackItems.set([null, null]);

    fixture.detectChanges();
    fixture.nativeElement.querySelector('[data-testid="equip-slot-0"]').click(); // pick up
    fixture.nativeElement
      .querySelector('[data-testid="backpack-slot-0"]')
      .click(); // drop

    expect(service.equippedItems()[0]).toBeNull();
    expect(service.backpackItems()[0]).toBe(item);
    expect(service.shakeSlot()).toBeNull();
  });

  it('should swap equipped item with backpack item', () => {
    const equippedItem = createForgedItem('sticking_plaster', {
      hp: 3,
      speed: 2,
    });
    const backpackItem = createForgedItem('wingfoot', { hp: 1, speed: 1 });
    service.equippedItems.set([equippedItem, null, null, null, null]);
    service.backpackItems.set([backpackItem, null]);

    fixture.detectChanges();
    fixture.nativeElement.querySelector('[data-testid="equip-slot-0"]').click(); // pick up equippedItem
    fixture.nativeElement
      .querySelector('[data-testid="backpack-slot-0"]')
      .click(); // drop on backpackItem

    expect(service.equippedItems()[0]).toBe(backpackItem);
    expect(service.backpackItems()[0]).toBe(equippedItem);
  });
});
