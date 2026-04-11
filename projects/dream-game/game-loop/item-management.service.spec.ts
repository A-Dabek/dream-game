import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  ItemManagementService,
  ForgedItemData,
} from './item-management.service';
import { PlayerProgressService } from './player-progress.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import type { Item, ItemId } from '@dream/game-board';

describe('ItemManagementService', () => {
  let service: ItemManagementService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ItemManagementService, PlayerProgressService],
    });
    service = TestBed.inject(ItemManagementService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('shakeSlot', () => {
    it('should start with null', () => {
      expect(service.shakeSlot()).toBeNull();
    });

    it('should set shake slot with triggerShake', () => {
      service.triggerShake('equip', 2);
      expect(service.shakeSlot()).toEqual({ area: 'equip', index: 2 });
    });

    it('should reset shake slot after timeout', async () => {
      service.triggerShake('backpack', 3);
      expect(service.shakeSlot()).toEqual({ area: 'backpack', index: 3 });

      await vi.advanceTimersByTimeAsync(450);
      expect(service.shakeSlot()).toBeNull();
    });

    it('should accept custom reset time', async () => {
      service.triggerShake('equip', 0, 200);
      await vi.advanceTimersByTimeAsync(199);
      expect(service.shakeSlot()).toBeTruthy();

      await vi.advanceTimersByTimeAsync(1);
      expect(service.shakeSlot()).toBeNull();
    });
  });

  describe('moveItem', () => {
    it('should swap items instead of overwriting', () => {
      const itemA = createForgedItem('sticking_plaster', { hp: 1, speed: 4 });
      const itemB = createForgedItem('wingfoot', { hp: 4, speed: 1 });
      service.backpackItems.set([itemA, itemB]);

      service.moveItem(
        { type: 'backpack', index: 0 },
        { type: 'backpack', index: 1 },
      );

      expect(service.backpackItems()[0]).toBe(itemB);
      expect(service.backpackItems()[1]).toBe(itemA);
    });

    it('should swap backpack item into empty equip slot', () => {
      const itemA = createForgedItem('sticking_plaster', { hp: 1, speed: 4 });
      service.backpackItems.set([itemA]);

      service.moveItem(
        { type: 'backpack', index: 0 },
        { type: 'equipped', slot: 0 },
      );

      expect(service.backpackItems()[0]).toBeNull();
      expect(service.equippedItems()[0]).toBe(itemA);
    });

    it('should swap equip slot item into backpack slot', () => {
      const equipItem = createForgedItem('sticking_plaster', {
        hp: 1,
        speed: 4,
      });
      const backpackItem = createForgedItem('wingfoot', { hp: 4, speed: 1 });
      service.equippedItems.set([equipItem, null, null, null, null]);
      service.backpackItems.set([backpackItem]);

      service.moveItem(
        { type: 'equipped', slot: 0 },
        { type: 'backpack', index: 0 },
      );

      expect(service.equippedItems()[0]).toBe(backpackItem);
      expect(service.backpackItems()[0]).toBe(equipItem);
    });
  });

  describe('canEquipToSlot', () => {
    it('should allow equipping positive-stat item from backpack to empty equip slot', () => {
      const stats = { hp: 3, speed: 2 };
      expect(service.canEquipToSlot(stats, 'backpack', 0, 'equip', 0)).toBe(
        true,
      );
    });

    it('should reject equipping item that would drop hp below 1', () => {
      const negativeItem = createForgedItem('sticking_plaster', {
        hp: -3,
        speed: 4,
      });
      service.equippedItems.set([
        negativeItem,
        negativeItem,
        negativeItem,
        negativeItem,
        negativeItem,
      ]);

      const newItem = { hp: -10, speed: 5 };
      expect(service.canEquipToSlot(newItem, 'backpack', 0, 'equip', 0)).toBe(
        false,
      );
    });
  });
});

function createForgedItem(
  id: ItemId,
  stats: { hp: number; speed: number },
): ForgedItemData {
  return {
    item: { id, genre: 'basic', remainingUsages: 1 } as Item,
    stats,
  };
}
