import {
  ItemConventionRegistry,
  registerItemConvention,
  registerIconPath,
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
        icon: 'attack',
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
      expect(display.pathD).toBe(
        ItemConventionRegistry.resolveIconPath('uncertainty'),
      );
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
    it('should register and resolve dynamic icon path', () => {
      const dynamicPath = 'M 0 0 L 100 100';
      registerIconPath('custom_sword', dynamicPath);
      expect(ItemConventionRegistry.resolveIconPath('custom_sword')).toBe(
        dynamicPath,
      );
    });

    it('should return fallback for nonexistent icon path', () => {
      const uncertaintyPath =
        ItemConventionRegistry.resolveIconPath('uncertainty');
      expect(ItemConventionRegistry.resolveIconPath('nonexistent_icon')).toBe(
        uncertaintyPath,
      );
    });

    it('should report correct results for hasIcon', () => {
      expect(hasIcon('punch')).toBe(true);
      expect(hasIcon('heal')).toBe(false); // Empty string placeholder
      expect(hasIcon('nonexistent')).toBe(false);

      registerIconPath('new_icon', 'M123');
      expect(hasIcon('new_icon')).toBe(true);
    });

    it('should return available icon names', () => {
      const names = getAvailableIconNames();
      expect(names).toContain('punch');
      expect(names).not.toContain('heal');
      expect(names).toContain('uncertainty');
    });

    it('should include dynamic icons in available icon names', () => {
      registerIconPath('another_dynamic', 'M456');
      const names = getAvailableIconNames();
      expect(names).toContain('another_dynamic');
    });
  });
});
