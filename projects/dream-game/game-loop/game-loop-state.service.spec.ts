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
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GameLoopStateService],
    });
    service = TestBed.inject(GameLoopStateService);
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

    it('should include equipped item stats', () => {
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
});
