import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { GameLoopStateService } from './game-loop-state.service';
import { PlayerProgressService } from './player-progress.service';
import { ItemManagementService } from './item-management.service';
import { FightManagerService } from './fight-manager.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import type { ItemId } from '@dream/game-board';

describe('GameLoopStateService', () => {
  let service: GameLoopStateService;
  let itemManagement: ItemManagementService;
  let fightManager: FightManagerService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GameLoopStateService,
        PlayerProgressService,
        ItemManagementService,
        FightManagerService,
      ],
    });
    service = TestBed.inject(GameLoopStateService);
    itemManagement = TestBed.inject(ItemManagementService);
    fightManager = TestBed.inject(FightManagerService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('FightManagerService / currentEnemy', () => {
    it('should start with null', () => {
      expect(fightManager.currentEnemy()).toBeNull();
    });

    it('should set and get enemy', () => {
      const enemy = { items: 'hand', health: 5, speed: 10 };
      fightManager.setEnemy(enemy);
      expect(fightManager.currentEnemy()).toEqual(enemy);
    });

    it('should reset enemy on resetRun', () => {
      fightManager.setEnemy({ items: 'hand', health: 5, speed: 10 });
      service.resetRun();
      expect(fightManager.currentEnemy()).toBeNull();
    });
  });

  describe('FightManagerService / buildFightState', () => {
    it('should return null when no enemy is set', () => {
      expect(fightManager.buildFightState()).toBeNull();
    });

    it('should build correct state string', () => {
      fightManager.setEnemy({ items: 'hand,punch', health: 10, speed: 5 });
      const state = fightManager.buildFightState();

      expect(state).toContain('hand,punch');
      expect(state).toContain('1'); // base hp
      expect(state).toContain('1'); // base speed
      expect(state).toContain('10'); // enemy health
      expect(state).toContain('5'); // enemy speed
    });

    it('should include equipped item stats', () => {
      const forgedItem: {
        item: { id: ItemId; genre: 'basic'; remainingUsages: number };
        stats: { hp: number; speed: number };
      } = {
        item: {
          id: 'sticking_plaster' as ItemId,
          genre: 'basic',
          remainingUsages: 1,
        },
        stats: { hp: 5, speed: 5 },
      };
      itemManagement.equippedItems.set([forgedItem, null, null, null, null]);

      fightManager.setEnemy({ items: 'hand', health: 5, speed: 1 });
      const state = fightManager.buildFightState();

      expect(state).toContain('sticking_plaster');
      expect(state).toContain(String(1 + forgedItem.stats.hp)); // base hp 1 + item hp
    });

    it('should clamp hp and speed to minimum of 1', () => {
      const negativeItem: {
        item: { id: ItemId; genre: 'basic'; remainingUsages: number };
        stats: { hp: number; speed: number };
      } = {
        item: { id: 'wingfoot' as ItemId, genre: 'basic', remainingUsages: 1 },
        stats: { hp: -10, speed: -10 },
      };
      itemManagement.equippedItems.set([
        negativeItem,
        negativeItem,
        negativeItem,
        negativeItem,
        negativeItem,
      ]);

      const stats = itemManagement.playerStats();
      expect(stats.hp).toBeGreaterThanOrEqual(1);
      expect(stats.speed).toBeGreaterThanOrEqual(1);
    });
  });
});
