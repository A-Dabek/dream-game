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
      expect(poisonStacks.length).toBe(2);

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
});
