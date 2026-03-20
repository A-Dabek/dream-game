import { describe, it, expect } from 'vitest';
import { Board } from '../impl/board';
import { createMockPlayer, passUntilTurn } from './test-utils';

describe('Doctor Items', () => {
  describe('Stitches', () => {
    it('should heal player and add stitches status effect', () => {
      const p1 = createMockPlayer('p1', {
        health: 50,
        maxHealth: 100,
        items: ['stitches'],
      });
      const p2 = createMockPlayer('p2', { health: 100, items: ['hand'] });
      const board = new Board(p1, p2);

      passUntilTurn(board, 'p1');
      board.playItem('stitches', 'p1');

      expect(board.gameState.player.health).toBe(60);
      const stitchesEffect = board.gameState.playerStatusEffects.find(
        (l) => l.type === 'stitches',
      );
      expect(stitchesEffect).toBeDefined();
      expect(stitchesEffect?.remainingCharges).toBe(10);
    });

    it('should heal player up to max health and add charges equal to actual heal', () => {
      const p1 = createMockPlayer('p1', {
        health: 95,
        maxHealth: 100,
        items: ['stitches'],
      });
      const p2 = createMockPlayer('p2', { health: 100, items: ['hand'] });
      const board = new Board(p1, p2);

      passUntilTurn(board, 'p1');
      board.playItem('stitches', 'p1');

      expect(board.gameState.player.health).toBe(100);
      const stitchesEffect = board.gameState.playerStatusEffects.find(
        (l) => l.type === 'stitches',
      );
      expect(stitchesEffect).toBeDefined();
      expect(stitchesEffect?.remainingCharges).toBe(5);
    });

    it('should reduce charges when taking damage and deal penalty when charges reach 0', () => {
      const p1 = createMockPlayer('p1', {
        health: 50,
        maxHealth: 100,
        items: ['stitches', 'hand'],
      });
      const p2 = createMockPlayer('p2', {
        health: 100,
        items: ['_blueprint_attack', 'hand'],
      });
      const board = new Board(p1, p2);

      passUntilTurn(board, 'p1');
      board.playItem('stitches', 'p1'); // Heals 10, adds 10 charges. Health: 60.

      passUntilTurn(board, 'p2');
      board.playItem('_blueprint_attack', 'p2'); // Deals 10 damage

      // Health: 60 - 10 (attack) - 10 (penalty when charges reach 0) = 40
      expect(board.gameState.player.health).toBe(40);
      expect(
        board.gameState.playerStatusEffects.some((l) => l.type === 'stitches'),
      ).toBe(false);
    });
  });

  describe('Adrenaline', () => {
    it('should grant +10 speed and apply heart strain', () => {
      const p1 = createMockPlayer('p1', {
        health: 100,
        speed: 10,
        items: ['adrenaline', 'hand'],
      });
      const p2 = createMockPlayer('p2', { health: 100, items: ['hand'] });
      const board = new Board(p1, p2);

      passUntilTurn(board, 'p1');
      board.playItem('adrenaline', 'p1');

      // Speed is 20 after play, but if p1 starts next turn immediately, it becomes 17
      const speed = board.gameState.player.speed;
      expect(speed === 20 || speed === 17).toBe(true);

      const heartStrain = board.gameState.playerStatusEffects.find(
        (l) => l.type === 'heart_strain',
      );
      expect(heartStrain).toBeDefined();
    });

    it('should reduce speed at the start of turn during heart strain', () => {
      const p1 = createMockPlayer('p1', {
        health: 100,
        speed: 10,
        items: ['adrenaline', 'hand'],
      });
      const p2 = createMockPlayer('p2', { health: 100, items: ['hand'] });
      const board = new Board(p1, p2);

      passUntilTurn(board, 'p1');
      board.playItem('adrenaline', 'p1'); // Speed 20 -> potentially 17

      // We wait for p1's next turn explicitly
      passUntilTurn(board, 'p2');
      passUntilTurn(board, 'p1');

      // After one more turn start, speed should have been reduced at least once
      expect(board.gameState.player.speed).toBeLessThan(20);
    });
  });

  describe('Drip', () => {
    it('should heal 1 health at turn start and turn end', () => {
      const p1 = createMockPlayer('p1', {
        health: 50,
        maxHealth: 100,
        items: ['drip', 'hand'],
      });
      const p2 = createMockPlayer('p2', { health: 100, items: ['hand'] });
      const board = new Board(p1, p2);

      passUntilTurn(board, 'p1');
      board.playItem('drip', 'p1'); // Turn end: +1 health (51)

      // Depending on whether next turn started or not, health might be 51 or 52
      const health = board.gameState.player.health;
      expect(health === 51 || health === 52).toBe(true);

      passUntilTurn(board, 'p2');
      passUntilTurn(board, 'p1');

      // After another full turn cycle, health should have increased more
      expect(board.gameState.player.health).toBeGreaterThan(51);
    });
  });

  it('does heal when played on full hp as first item', () => {
    const p1 = createMockPlayer('p1', {
      health: 10,
      maxHealth: 10,
      speed: 100,
      items: ['drip', 'hand'],
    });
    const p2 = createMockPlayer('p2', {
      health: 100,
      speed: 99,
      items: ['punch', 'punch'],
    });
    const board = new Board(p1, p2);

    board.playItem('drip', 'p1');
    expect(board.gameState.player.health).toBe(10);

    board.playItem('punch', 'p2');
    expect(board.gameState.player.health).toBe(6);

    board.pass('p1');
    expect(board.gameState.player.health).toBe(7);

    board.playItem('punch', 'p2');
    expect(board.gameState.player.health).toBe(3);
  });

  it('does heal when played on damaged hp as first item', () => {
    const p1 = createMockPlayer('p1', {
      health: 9,
      maxHealth: 10,
      speed: 100,
      items: ['drip', 'hand'],
    });
    const p2 = createMockPlayer('p2', {
      health: 100,
      speed: 99,
      items: ['punch', 'punch'],
    });
    const board = new Board(p1, p2);

    board.playItem('drip', 'p1');
    // healed 1
    expect(board.gameState.player.health).toBe(10);

    board.playItem('punch', 'p2');
    // damaged 5, start of turn - healed 1
    expect(board.gameState.player.health).toBe(6);

    board.pass('p1');
    // healed 1
    expect(board.gameState.player.health).toBe(7);

    board.playItem('punch', 'p2');
    // damaged 5, start of turn - healed 1
    expect(board.gameState.player.health).toBe(3);

    // No error - game is not over yet
    board.pass('p1');
  });
});
