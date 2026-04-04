import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  GameLoopStateService,
  forgeItemStats,
} from './game-loop-state.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import type { ItemId } from '@dream/game-board';

describe('GameLoopStateService', () => {
  let service: GameLoopStateService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GameLoopStateService],
    });
    service = TestBed.inject(GameLoopStateService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('currentEnemy', () => {
    it('should start with null', () => {
      expect(service.currentEnemy()).toBeNull();
    });

    it('should set and get enemy', () => {
      const enemy = { items: 'hand', health: 5, speed: 10 };
      service.setEnemy(enemy);
      expect(service.currentEnemy()).toEqual(enemy);
    });

    it('should reset enemy on resetRun', () => {
      service.setEnemy({ items: 'hand', health: 5, speed: 10 });
      service.resetRun();
      expect(service.currentEnemy()).toBeNull();
    });
  });

  describe('buildFightState', () => {
    it('should return null when no enemy is set', () => {
      expect(service.buildFightState()).toBeNull();
    });

    it('should build correct state string', () => {
      service.setEnemy({ items: 'hand,punch', health: 10, speed: 5 });
      const state = service.buildFightState();

      expect(state).toContain('hand,punch');
      expect(state).toContain('1'); // base hp
      expect(state).toContain('1'); // base speed
      expect(state).toContain('10'); // enemy health
      expect(state).toContain('5'); // enemy speed
    });

    it.skip('should include equipped item stats', () => {
      const stats = forgeItemStats();
      const forgedItem: {
        item: { id: ItemId; genre: 'basic'; remainingUsages: number };
        stats: { hp: number; speed: number };
      } = {
        item: {
          id: 'sticking_plaster' as ItemId,
          genre: 'basic',
          remainingUsages: 1,
        },
        stats,
      };
      service.equippedItems.set([forgedItem, null, null, null, null]);

      service.setEnemy({ items: 'hand', health: 5, speed: 1 });
      const state = service.buildFightState();

      expect(state).toContain('sticking_plaster');
      expect(state).toContain(String(1 + stats.hp)); // base hp 1 + item hp
    });

    it('should clamp hp and speed to minimum of 1', () => {
      const negativeItem: {
        item: { id: ItemId; genre: 'basic'; remainingUsages: number };
        stats: { hp: number; speed: number };
      } = {
        item: { id: 'wingfoot' as ItemId, genre: 'basic', remainingUsages: 1 },
        stats: { hp: -10, speed: -10 },
      };
      service.equippedItems.set([
        negativeItem,
        negativeItem,
        negativeItem,
        negativeItem,
        negativeItem,
      ]);

      const stats = service.playerStats();
      expect(stats.hp).toBeGreaterThanOrEqual(1);
      expect(stats.speed).toBeGreaterThanOrEqual(1);
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

    it('should not move when source is null', () => {
      service.backpackItems.set([null, null]);

      service.moveItem(
        { type: 'backpack', index: 0 },
        { type: 'backpack', index: 1 },
      );

      expect(service.backpackItems()[0]).toBeNull();
      expect(service.backpackItems()[1]).toBeNull();
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

    it('should reject equipping item that would drop speed below 1', () => {
      const negativeItem = createForgedItem('sticking_plaster', {
        hp: 4,
        speed: -3,
      });
      service.equippedItems.set([
        negativeItem,
        negativeItem,
        negativeItem,
        negativeItem,
        negativeItem,
      ]);

      const newItem = { hp: 5, speed: -10 };
      expect(service.canEquipToSlot(newItem, 'backpack', 0, 'equip', 0)).toBe(
        false,
      );
    });

    it('should allow equip-to-equip swap when stats stay valid', () => {
      const itemA = createForgedItem('sticking_plaster', { hp: -2, speed: 3 });
      const itemB = createForgedItem('wingfoot', { hp: 3, speed: -2 });
      service.equippedItems.set([itemA, itemB, null, null, null]);

      expect(service.canEquipToSlot(itemA.stats, 'equip', 0, 'equip', 1)).toBe(
        true,
      );
    });

    it('should reject when unequipping positive item and equipping negative one', () => {
      const positiveItem = createForgedItem('sticking_plaster', {
        hp: 3,
        speed: 2,
      });
      service.equippedItems.set([positiveItem, null, null, null, null]);

      const negativeNewItem = { hp: -4, speed: 4 };
      expect(
        service.canEquipToSlot(negativeNewItem, 'equip', 1, 'equip', 0),
      ).toBe(false);
    });
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
});

function createForgedItem(
  id: ItemId,
  stats: { hp: number; speed: number },
): {
  item: { id: ItemId; genre: 'basic'; remainingUsages: number };
  stats: { hp: number; speed: number };
} {
  return {
    item: { id, genre: 'basic', remainingUsages: 1 },
    stats,
  };
}
