import {
  ItemConventionRegistry,
  registerItemConvention,
  hasIcon,
  getAvailableIconNames,
  generateDescriptionFromEffects,
} from './convention-registry';
import { Effect } from '@dream/game-board';

describe('ItemConventionRegistry', () => {
  describe('getItemConvention', () => {
    it('should return static convention for existing item', () => {
      const entry = ItemConventionRegistry.getItemConvention('punch');
      expect(entry.icon).toBe('punch');
    });

    it('should return fallback for nonexistent item', () => {
      const entry = ItemConventionRegistry.getItemConvention(
        'nonexistent_item' as any,
      );
      expect(entry.icon).toBe('uncertainty');
      expect(entry.description).toBe('Nonexistent Item');
    });

    it('should return dynamic convention if registered', () => {
      registerItemConvention('fiery_sword', {
        name: 'Fiery Sword',
        icon: 'attack' as any,
        description: 'A fiery sword',
      });
      const entry = ItemConventionRegistry.getItemConvention('fiery_sword');
      expect(entry.icon).toBe('attack');
      expect(entry.description).toBe('A fiery sword');
    });
  });

  describe('getStatusEffectDisplay', () => {
    it('should return static convention for existing effect', () => {
      const display = ItemConventionRegistry.getStatusEffectDisplay('negate');
      expect(display.description.toLowerCase()).toContain('negate');
    });

    it('should return fallback for nonexistent effect', () => {
      const display = ItemConventionRegistry.getStatusEffectDisplay(
        'nonexistent_effect' as any,
      );
      expect(display.description).toBe('Nonexistent Effect');
    });
  });

  describe('generateDescriptionFromEffects', () => {
    it('should generate description for damage effect', () => {
      const effects: Effect[] = [
        { type: 'damage', value: 10, target: 'enemy' },
      ];
      expect(generateDescriptionFromEffects(effects)).toBe('Deals 10 damage');
    });

    it('should generate description for multiple effects', () => {
      const effects: Effect[] = [
        { type: 'damage', value: 10, target: 'enemy' },
        { type: 'healing', value: 5, target: 'self' },
      ];
      expect(generateDescriptionFromEffects(effects)).toBe(
        'Deals 10 damage. Heals 5 health',
      );
    });

    it('should generate description for passive effects', () => {
      const effects: Effect[] = [];
      const passives: any[] = [{}];
      expect(generateDescriptionFromEffects(effects, passives)).toBe(
        '1 passive effect',
      );
    });
  });

  describe('Icon System Utilities', () => {
    it('should report correct results for hasIcon', () => {
      expect(hasIcon('punch')).toBe(false); // No dynamic icons yet
      expect(hasIcon('nonexistent')).toBe(false);
    });

    it('should return available icon names', () => {
      const names = getAvailableIconNames();
      expect(names).toContain('punch');
      expect(names).toContain('uncertainty');
    });
  });
});
