import { createCpuPlayer } from './player';
import { PlayerRating } from '../rating';
import { FirstAvailableStrategy } from '../ai';

describe('Player Module', () => {
  describe('createCpuPlayer', () => {
    it('should create a player with given id and name', () => {
      const player = createCpuPlayer('test-id', 'Test Bot');
      expect(player.id).toBe('test-id');
      expect(player.name).toBe('Test Bot');
    });

    it('should initialize with basic rating and strategy', () => {
      const player = createCpuPlayer('test-id', 'Test Bot');
      expect(player.rating).toBeInstanceOf(PlayerRating);
      expect(player.rating.value).toBe(1200);
      expect(player.strategy).toBeInstanceOf(FirstAvailableStrategy);
    });

    it('should create a loadout with 5 items', () => {
      const player = createCpuPlayer('test-id', 'Test Bot');
      expect(player.loadout.items.length).toBe(5);
      player.loadout.items.forEach((item) => {
        expect(item.id).toBeDefined();
        expect(item.instanceId).toMatch(/^test-id-item-\d$/);
      });
    });

    it('should randomize health and speed within expected ranges', () => {
      // Run multiple times to increase confidence in randomization
      for (let i = 0; i < 10; i++) {
        const player = createCpuPlayer('test-id', 'Test Bot');
        expect(player.loadout.health).toBeGreaterThanOrEqual(10);
        expect(player.loadout.health).toBeLessThanOrEqual(15);
        expect(player.loadout.speed).toBeGreaterThanOrEqual(5);
        expect(player.loadout.speed).toBeLessThanOrEqual(10);
      }
    });
  });
});
