import { TestBed } from '@angular/core/testing';
import { GameLoopStateService } from './game-loop-state.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

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
      // Add item to equipped slot - sticking_plaster gives +10 hp
      service.equippedItems.set([
        { id: 'sticking_plaster', genre: 'basic', remainingUsages: 1 },
        null,
        null,
        null,
        null,
      ]);

      service.setEnemy({ items: 'hand', health: 5, speed: 1 });
      const state = service.buildFightState();

      expect(state).toContain('sticking_plaster');
      expect(state).toContain('11'); // base hp 1 + 10 from item
    });
  });
});
