import { describe, it, expect } from 'vitest';
import { ItemId } from '../item';
import {
  createCpuPlayer,
  createCpuPlayerWithConfig,
  createGamePlayers,
} from './player';
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

    it('should create a loadout with 1 random item', () => {
      const player = createCpuPlayer('test-id', 'Test Bot');
      expect(player.loadout.items.length).toBe(1);
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

  describe('createCpuPlayerWithConfig', () => {
    it('should create player with exact health', () => {
      const player = createCpuPlayerWithConfig('test-id', 'Test Bot', {
        health: 25,
      });
      expect(player.loadout.health).toBe(25);
    });

    it('should create player with exact speed', () => {
      const player = createCpuPlayerWithConfig('test-id', 'Test Bot', {
        speed: 8,
      });
      expect(player.loadout.speed).toBe(8);
    });

    it('should create player with exact items', () => {
      const player = createCpuPlayerWithConfig('test-id', 'Test Bot', {
        items: ['punch', 'wingfoot'] as ItemId[],
      });
      expect(player.loadout.items.length).toBe(2);
      expect(player.loadout.items[0].id).toBe('punch');
      expect(player.loadout.items[1].id).toBe('wingfoot');
    });

    it('should filter out invalid item IDs', () => {
      const player = createCpuPlayerWithConfig('test-id', 'Test Bot', {
        items: ['punch', 'invalid_item', 'wingfoot'] as ItemId[],
      });
      expect(player.loadout.items.length).toBe(2);
      expect(player.loadout.items[0].id).toBe('punch');
      expect(player.loadout.items[1].id).toBe('wingfoot');
    });

    it('should handle empty items array', () => {
      const player = createCpuPlayerWithConfig('test-id', 'Test Bot', {
        items: [] as ItemId[],
      });
      expect(player.loadout.items.length).toBe(0);
    });

    it('should fallback to random health when value is not positive', () => {
      const player = createCpuPlayerWithConfig('test-id', 'Test Bot', {
        health: 0,
      });
      expect(player.loadout.health).toBeGreaterThanOrEqual(10);
      expect(player.loadout.health).toBeLessThanOrEqual(15);
    });

    it('should fallback to random health when value is negative', () => {
      const player = createCpuPlayerWithConfig('test-id', 'Test Bot', {
        health: -5,
      });
      expect(player.loadout.health).toBeGreaterThanOrEqual(10);
      expect(player.loadout.health).toBeLessThanOrEqual(15);
    });

    it('should fallback to random speed when value is not positive', () => {
      const player = createCpuPlayerWithConfig('test-id', 'Test Bot', {
        speed: 0,
      });
      expect(player.loadout.speed).toBeGreaterThanOrEqual(5);
      expect(player.loadout.speed).toBeLessThanOrEqual(10);
    });

    it('should fallback to random speed when value is negative', () => {
      const player = createCpuPlayerWithConfig('test-id', 'Test Bot', {
        speed: -5,
      });
      expect(player.loadout.speed).toBeGreaterThanOrEqual(5);
      expect(player.loadout.speed).toBeLessThanOrEqual(10);
    });

    it('should create player with complete config', () => {
      const player = createCpuPlayerWithConfig('test-id', 'Test Bot', {
        items: ['punch', 'sticking_plaster'] as ItemId[],
        health: 30,
        speed: 12,
      });
      expect(player.loadout.health).toBe(30);
      expect(player.loadout.speed).toBe(12);
      expect(player.loadout.items.length).toBe(2);
    });
  });

  describe('createGamePlayers', () => {
    it('should create both players with default config when no config provided', () => {
      const { player1, player2 } = createGamePlayers();
      expect(player1.id).toBe('player-1');
      expect(player2.id).toBe('player-2');
      expect(player1.loadout.health).toBeGreaterThanOrEqual(10);
      expect(player2.loadout.health).toBeGreaterThanOrEqual(10);
    });

    it('should create player1 with custom config and player2 with defaults', () => {
      const { player1, player2 } = createGamePlayers({
        player1: {
          items: ['punch'] as ItemId[],
          health: 50,
          speed: 15,
        },
      });
      expect(player1.loadout.health).toBe(50);
      expect(player1.loadout.speed).toBe(15);
      expect(player1.loadout.items.length).toBe(1);
      expect(player2.loadout.health).toBeGreaterThanOrEqual(10);
      expect(player2.loadout.health).toBeLessThanOrEqual(15);
    });

    it('should create both players with custom configs', () => {
      const { player1, player2 } = createGamePlayers({
        player1: {
          items: ['punch', 'wingfoot'] as ItemId[],
          health: 40,
          speed: 10,
        },
        player2: {
          items: ['sticky_boot'] as ItemId[],
          health: 30,
          speed: 8,
        },
      });
      expect(player1.loadout.health).toBe(40);
      expect(player1.loadout.speed).toBe(10);
      expect(player1.loadout.items.length).toBe(2);
      expect(player2.loadout.health).toBe(30);
      expect(player2.loadout.speed).toBe(8);
      expect(player2.loadout.items.length).toBe(1);
    });

    it('should handle partial config for both players', () => {
      const { player1, player2 } = createGamePlayers({
        player1: { health: 35 },
        player2: { speed: 20 },
      });
      expect(player1.loadout.health).toBe(35);
      expect(player2.loadout.speed).toBe(20);
    });
  });
});
