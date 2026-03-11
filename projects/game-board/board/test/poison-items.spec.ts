import { describe, it, expect } from 'vitest';
import { Board } from '../impl/board';
import { createMockPlayer, passUntilTurn } from './test-utils';

describe('Poison Items', () => {
  describe('Antidote', () => {
    it('should remove all poison status effects from the player', () => {
      const p1 = createMockPlayer('p1', {
        health: 20,
        items: ['antidote', 'gas_grenade'],
      });
      const p2 = createMockPlayer('p2', { health: 20, items: ['hand'] });
      const board = new Board(p1, p2);

      passUntilTurn(board, 'p1');
      // Manually add poison to p1
      board.playItem('gas_grenade', 'p1'); // This adds 10 poison to both

      expect(
        board.gameState.playerStatusEffects.some((l) => l.type === 'poison'),
      ).toBe(true);
      expect(
        board.gameState.opponentStatusEffects.some((l) => l.type === 'poison'),
      ).toBe(true);

      passUntilTurn(board, 'p1');
      board.playItem('antidote', 'p1');

      expect(
        board.gameState.playerStatusEffects.some((l) => l.type === 'poison'),
      ).toBe(false);
      // Opponent should still be poisoned
      expect(
        board.gameState.opponentStatusEffects.some((l) => l.type === 'poison'),
      ).toBe(true);
    });

    it('should remove multiple poison stacks from the player', () => {
      const p1 = createMockPlayer('p1', {
        health: 50,
        items: ['antidote', 'gas_grenade', 'poison_drink'],
      });
      const p2 = createMockPlayer('p2', { health: 50, items: ['hand'] });
      const board = new Board(p1, p2);

      passUntilTurn(board, 'p1');
      board.playItem('gas_grenade', 'p1'); // stack 1
      passUntilTurn(board, 'p1');
      board.playItem('poison_drink', 'p1'); // stack 2

      const poisonStacks = board.gameState.playerStatusEffects.filter(
        (l) => l.type === 'poison',
      );
      expect(poisonStacks.length).toBe(1); // Merged into single effect

      passUntilTurn(board, 'p1');
      board.playItem('antidote', 'p1');

      expect(
        board.gameState.playerStatusEffects.some((l) => l.type === 'poison'),
      ).toBe(false);
    });
  });

  describe('Gas Mask', () => {
    it('should negate poison application and decrement charges', () => {
      const p1 = createMockPlayer('p1', {
        health: 20,
        items: ['gas_mask'],
      });
      const p2 = createMockPlayer('p2', { health: 20, items: ['gas_grenade'] });
      const board = new Board(p1, p2);

      passUntilTurn(board, 'p1');
      board.playItem('gas_mask', 'p1');

      const gasMaskListener = board.gameState.playerStatusEffects.find(
        (l) => l.type === 'gas_mask',
      );
      expect(gasMaskListener).toBeDefined();
      expect(gasMaskListener?.remainingCharges).toBe(3);

      passUntilTurn(board, 'p2');
      // p2 plays gas grenade, which applies poison to both
      board.playItem('gas_grenade', 'p2');

      // p1 should NOT have poison
      expect(
        board.gameState.playerStatusEffects.some((l) => l.type === 'poison'),
      ).toBe(false);

      // Gas mask charge should be decremented
      const updatedGasMaskListener = board.gameState.playerStatusEffects.find(
        (l) => l.type === 'gas_mask',
      );
      expect(updatedGasMaskListener?.remainingCharges).toBe(2);
    });
  });

  describe('Poison Drink', () => {
    it('should apply 20 poison charges to the user', () => {
      const p1 = createMockPlayer('p1', {
        health: 40,
        items: ['poison_drink'],
      });
      const p2 = createMockPlayer('p2', { items: [] });
      const board = new Board(p1, p2);

      passUntilTurn(board, 'p1');
      board.playItem('poison_drink', 'p1');

      const poisonListener = board.gameState.playerStatusEffects.find(
        (l) => l.type === 'poison',
      );
      expect(poisonListener).toBeDefined();
      expect(poisonListener?.remainingCharges).toBe(19); // 20 - 1 at turn end
    });
  });

  describe('Poison Darts', () => {
    it('should apply poison_darts status to the enemy', () => {
      const p1 = createMockPlayer('p1', { items: ['poison_darts'] });
      const p2 = createMockPlayer('p2', { items: [] });
      const board = new Board(p1, p2);

      passUntilTurn(board, 'p1');
      board.playItem('poison_darts', 'p1');

      const dartsListener = board.gameState.opponentStatusEffects.find(
        (l) => l.type === 'poison_darts',
      );
      expect(dartsListener).toBeDefined();
    });

    it('should apply poison at the end of enemy turn', () => {
      const p1 = createMockPlayer('p1', { items: ['poison_darts'] });
      const p2 = createMockPlayer('p2', { items: ['hand'] });
      const board = new Board(p1, p2);

      passUntilTurn(board, 'p1');
      board.playItem('poison_darts', 'p1');

      passUntilTurn(board, 'p2');
      // Advance to p2 turn and end it
      board.playItem('hand', 'p2');

      // Now p2 should have poison
      const poisonListener = board.gameState.opponentStatusEffects.find(
        (l) => l.type === 'poison',
      );
      expect(poisonListener).toBeDefined();
      expect(poisonListener?.remainingCharges).toBe(1);
    });
  });

  describe('Poison Merge Strategy', () => {
    it('should merge poison charges when applied consecutively to the same player', () => {
      const p1 = createMockPlayer('p1', {
        health: 100,
        items: ['gas_grenade', 'poison_drink', 'hand'],
      });
      const p2 = createMockPlayer('p2', { health: 100, items: ['hand'] });
      const board = new Board(p1, p2);

      passUntilTurn(board, 'p1');
      // Apply first poison (10 charges from gas_grenade)
      board.playItem('gas_grenade', 'p1');

      // Check that poison is applied to p1
      let poisonEffect = board.gameState.playerStatusEffects.find(
        (l) => l.type === 'poison',
      );
      expect(poisonEffect).toBeDefined();
      expect(poisonEffect?.remainingCharges).toBe(9); // 10 - 1 at turn end
      const firstPoisonInstanceId = poisonEffect?.instanceId;

      // Apply second poison (20 charges from poison_drink)
      passUntilTurn(board, 'p1');
      board.playItem('poison_drink', 'p1');

      // Check that poison charges are merged into a single effect
      const poisonEffects = board.gameState.playerStatusEffects.filter(
        (l) => l.type === 'poison',
      );
      expect(poisonEffects.length).toBe(1); // Should still be only 1 poison effect
      // Poison at 9 charges (from gas_grenade after 1 turn end in playItem)
      // + 20 charges (from poison_drink) = 29
      // Then turn end happens, decreasing to 28
      expect(poisonEffects[0].remainingCharges).toBe(28); // (9 + 20 - 1 at turn end)
      expect(poisonEffects[0].instanceId).toBe(firstPoisonInstanceId); // Same instance
    });

    it('should merge poison applied from different sources', () => {
      const p1 = createMockPlayer('p1', {
        health: 100,
        items: ['hand', 'poison_drink'],
      });
      const p2 = createMockPlayer('p2', {
        health: 100,
        items: ['gas_grenade', 'hand'],
      });
      const board = new Board(p1, p2);

      // p1 applies poison to themselves
      passUntilTurn(board, 'p1');
      board.playItem('poison_drink', 'p1');

      let poisonEffect = board.gameState.playerStatusEffects.find(
        (l) => l.type === 'poison',
      );
      expect(poisonEffect).toBeDefined();
      expect(poisonEffect?.remainingCharges).toBe(19); // 20 - 1 at turn end
      const firstInstanceId = poisonEffect?.instanceId;

      // p2 applies poison to p1 as enemy
      passUntilTurn(board, 'p2');
      board.playItem('gas_grenade', 'p2');

      // Check that poison is merged
      const poisonEffects = board.gameState.playerStatusEffects.filter(
        (l) => l.type === 'poison',
      );
      expect(poisonEffects.length).toBe(1); // Still 1 poison effect
      // Poison at 19 charges after p1's turn end (from poison_drink: 20 - 1)
      // + 10 charges (from gas_grenade) = 29
      // Then turn end happens, decreasing to 28
      expect(poisonEffects[0].remainingCharges).toBe(29); // (19 + 10 - 1 at turn end)
      expect(poisonEffects[0].instanceId).toBe(firstInstanceId); // Same instance
    });

    it('should keep separate poison effects on different players', () => {
      const p1 = createMockPlayer('p1', {
        health: 100,
        items: ['poison_drink', 'gas_grenade', 'hand'],
      });
      const p2 = createMockPlayer('p2', {
        health: 100,
        items: ['hand'],
      });
      const board = new Board(p1, p2);

      // p1 applies poison to themselves
      passUntilTurn(board, 'p1');
      board.playItem('poison_drink', 'p1');

      // p1 applies poison to p2 (as enemy)
      passUntilTurn(board, 'p1');
      board.playItem('gas_grenade', 'p1');

      // Check that p1 has poison (self) - after gas_grenade applies and merges
      const p1PoisonEffects = board.gameState.playerStatusEffects.filter(
        (l) => l.type === 'poison',
      );
      expect(p1PoisonEffects.length).toBe(1);
      // After gas_grenade: 18 (existing) + 10 (gas_grenade) - 1 (turn end) = 27
      expect(p1PoisonEffects[0].remainingCharges).toBe(28);

      // Check that p2 has poison (opponent) - gas_grenade applies 10 to enemy
      const p2PoisonEffects = board.gameState.opponentStatusEffects.filter(
        (l) => l.type === 'poison',
      );
      expect(p2PoisonEffects.length).toBe(1);
      // 10 - 1 (turn end) = 9
      expect(p2PoisonEffects[0].remainingCharges).toBe(10);

      // p1 applies more poison to themselves
      passUntilTurn(board, 'p1');
      board.playItem('hand', 'p1'); // Use hand to pass and trigger turn end

      // The poison on p1 should remain merged, and poison on p2 should be unaffected
      const updatedP1PoisonEffects = board.gameState.playerStatusEffects.filter(
        (l) => l.type === 'poison',
      );
      expect(updatedP1PoisonEffects.length).toBe(1); // Still 1 poison effect on p1
      expect(updatedP1PoisonEffects[0].remainingCharges).toBeLessThan(28); // Decremented at turn end

      const updatedP2PoisonEffects =
        board.gameState.opponentStatusEffects.filter(
          (l) => l.type === 'poison',
        );
      expect(updatedP2PoisonEffects.length).toBe(1); // Still 1 poison effect on p2
      expect(updatedP2PoisonEffects[0].remainingCharges).toBe(9); // Decrements at any turn end
    });
  });
});
