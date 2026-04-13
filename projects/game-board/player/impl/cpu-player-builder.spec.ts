import { describe, it, expect } from 'vitest';
import { FirstAvailableStrategy } from '../../ai';
import { PlayerRating } from '../../rating';
import { CpuPlayerBuilder } from './cpu-player-builder';

describe('CpuPlayerBuilder', () => {
  describe('initialization', () => {
    it('should create a builder with id and name', () => {
      const builder = new CpuPlayerBuilder('test-id', 'Test Bot');
      expect(builder.id).toBe('test-id');
      expect(builder.name).toBe('Test Bot');
    });
  });

  describe('withNormalSpeed', () => {
    it('should generate speed using normal distribution', () => {
      for (let i = 0; i < 10; i++) {
        const player = new CpuPlayerBuilder('id', 'name')
          .withNormalSpeed(25, 3, 1)
          .withLeftMostStrategy()
          .build();

        // With mean 25 and stdDev 3, most values should be within 3 std devs
        expect(player.loadout.speed).toBeGreaterThanOrEqual(1);
        expect(player.loadout.speed).toBeLessThan(35);
      }
    });
  });

  describe('withRandomItems', () => {
    it('should set the number of random items', () => {
      const player = new CpuPlayerBuilder('id', 'name')
        .withRandomItems(3)
        .withLeftMostStrategy()
        .build();

      expect(player.loadout.items.length).toBe(3);
    });

    it('should generate unique instanceIds for each item', () => {
      const player = new CpuPlayerBuilder('id', 'name')
        .withRandomItems(5)
        .withLeftMostStrategy()
        .build();

      const instanceIds = player.loadout.items.map((item) => item.instanceId);
      const uniqueInstanceIds = new Set(instanceIds);

      expect(uniqueInstanceIds.size).toBe(5);
    });

    it('should handle zero items', () => {
      const player = new CpuPlayerBuilder('id', 'name')
        .withRandomItems(0)
        .withLeftMostStrategy()
        .build();

      expect(player.loadout.items.length).toBe(0);
    });

    it('should handle negative items by treating as zero', () => {
      const player = new CpuPlayerBuilder('id', 'name')
        .withRandomItems(-5)
        .withLeftMostStrategy()
        .build();

      expect(player.loadout.items.length).toBe(0);
    });
  });

  describe('withConfig', () => {
    it('should apply config items', () => {
      const player = new CpuPlayerBuilder('id', 'name')
        .withConfig({
          items: ['wingfoot', 'punch'],
          health: 30,
          speed: 12,
        })
        .withLeftMostStrategy()
        .build();

      expect(player.loadout.health).toBe(30);
      expect(player.loadout.speed).toBe(12);
      expect(player.loadout.items.length).toBe(2);
    });

    it('should apply partial config', () => {
      const player = new CpuPlayerBuilder('id', 'name')
        .withConfig({
          speed: 99,
        })
        .withRandomItems(2)
        .withLeftMostStrategy()
        .build();

      expect(player.loadout.speed).toBe(99);
    });

    it('should override normal distribution in config', () => {
      const player = new CpuPlayerBuilder('id', 'name')
        .withNormalSpeed(20, 3, 1)
        .withConfig({
          speed: 42,
        })
        .withRandomItems(2)
        .withLeftMostStrategy()
        .build();

      expect(player.loadout.speed).toBe(42);
    });
  });

  describe('withLeftMostStrategy', () => {
    it('should set the strategy to FirstAvailableStrategy', () => {
      const player = new CpuPlayerBuilder('id', 'name')
        .withRandomItems(5)
        .withLeftMostStrategy()
        .build();

      expect(player.strategy).toBeInstanceOf(FirstAvailableStrategy);
    });
  });

  describe('build', () => {
    it('should throw error if no strategy is configured', () => {
      const builder = new CpuPlayerBuilder('id', 'name').withRandomItems(5);

      expect(() => builder.build()).toThrow(
        'Strategy must be configured before building',
      );
    });

    it('should create a complete player with all properties', () => {
      const player = new CpuPlayerBuilder('test-id', 'Test Bot')
        .withRandomItems(5)
        .withLeftMostStrategy()
        .build();

      expect(player.id).toBe('test-id');
      expect(player.name).toBe('Test Bot');
      expect(player.rating).toBeInstanceOf(PlayerRating);
      expect(player.rating.value).toBe(1200);
      expect(player.strategy).toBeInstanceOf(FirstAvailableStrategy);
      expect(player.loadout.health).toBeGreaterThanOrEqual(10);
      expect(player.loadout.health).toBeLessThanOrEqual(15);
      expect(player.loadout.speed).toBeGreaterThanOrEqual(1);
      expect(player.loadout.items.length).toBe(5);
    });
  });

  describe('fluent interface', () => {
    it('should allow method chaining', () => {
      const player = new CpuPlayerBuilder('id', 'name')
        .withRandomItems(3)
        .withLeftMostStrategy()
        .build();

      expect(player).toBeDefined();
      expect(player.loadout.items.length).toBe(3);
    });

    it('should allow calling methods in any order', () => {
      const player = new CpuPlayerBuilder('id', 'name')
        .withRandomItems(2)
        .withLeftMostStrategy()
        .build();

      expect(player.loadout.speed).toBeGreaterThanOrEqual(1);
      expect(player.loadout.items.length).toBe(2);
    });

    it('should allow overriding previous configurations', () => {
      const player = new CpuPlayerBuilder('id', 'name')
        .withRandomItems(5)
        .withRandomItems(2)
        .withLeftMostStrategy()
        .build();

      expect(player.loadout.items.length).toBe(2);
    });
  });
});
