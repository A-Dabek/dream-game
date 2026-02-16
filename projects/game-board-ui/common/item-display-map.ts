import { ItemId } from '@dream/item';

export interface ItemDisplayMetadata {
  readonly iconName: string;
  readonly description: string;
}

const ITEM_DISPLAY_MAP: Record<ItemId, ItemDisplayMetadata> = {
  // Blueprint items (test/internal items)
  _blueprint_attack: {
    iconName: 'attack',
    description: 'A test attack item dealing standard damage.',
  },
  _blueprint_passive_attack: {
    iconName: 'passive-attack',
    description: 'A test item with passive attack effects.',
  },
  _blueprint_reactive_removal: {
    iconName: 'reactive-removal',
    description: 'A test item that reacts by removing items.',
  },
  _blueprint_damage_to_heal_charges: {
    iconName: 'damage-to-heal-charges',
    description: 'A test item that converts damage to healing (charge-based).',
  },
  _blueprint_damage_to_heal_turns: {
    iconName: 'damage-to-heal-turns',
    description: 'A test item that converts damage to healing (turn-based).',
  },
  _blueprint_damage_to_heal_permanent: {
    iconName: 'damage-to-heal-permanent',
    description: 'A test item that converts damage to healing permanently.',
  },
  _blueprint_self_damage: {
    iconName: 'self-damage',
    description: 'A test item that deals damage to the user.',
  },
  _blueprint_negate_damage: {
    iconName: 'negate-damage',
    description: 'A test item that negates incoming damage.',
  },
  _blueprint_triple_threat: {
    iconName: 'triple-threat',
    description: 'A test item that performs multiple effects at once.',
  },
  _blueprint_heal_5: {
    iconName: 'heal-5',
    description: 'A test healing item that restores 5 health.',
  },
  _dummy: {
    iconName: 'dummy',
    description: 'A dummy item with no effect.',
  },

  // Playable items
  punch: {
    iconName: 'punch',
    description: 'Deal damage to the enemy.',
  },
  sticking_plaster: {
    iconName: 'sticking-plaster',
    description: 'Restore health to yourself.',
  },
  hand: {
    iconName: 'hand',
    description: 'Pass your turn without taking action.',
  },
  sticky_boot: {
    iconName: 'sticky-boot',
    description: 'Reduce the enemy speed.',
  },
  wingfoot: {
    iconName: 'wingfoot',
    description: 'Increase your speed for faster turns.',
  },
};

/**
 * Registry for item display metadata.
 * Provides access to icon names and descriptions for items.
 */
export const ItemDisplayRegistry = {
  getMetadata(itemId: ItemId): ItemDisplayMetadata {
    return ITEM_DISPLAY_MAP[itemId];
  },

  hasMetadata(itemId: string): itemId is ItemId {
    return itemId in ITEM_DISPLAY_MAP;
  },

  PASS_ICON_NAME: 'fast-forward-button' as const,
} as const;
