import { ItemId, StatusEffectType, ActiveEffectId } from '@dream/game-board';
import {
  ACTIVE_EFFECT_DISPLAY_MAP,
  EffectDisplayMetadata,
} from '../common/active-effect-display-map';

import iconPathsJson from './icon-paths.json';
import basicItemsJson from './basic-items.json';
import basicStatusEffectsJson from './basic-status-effects.json';
import poisonItemsJson from './poison-items.json';
import poisonStatusEffectsJson from './poison-status-effects.json';

export interface ItemDisplayMetadata {
  readonly pathD: string;
  readonly description: string;
}

export type IconName = keyof typeof iconPathsJson;

export interface ConventionEntry {
  readonly icon: string;
  readonly description: string;
}

export type ItemConventionMap = Record<ItemId, ConventionEntry>;
export type StatusEffectConventionMap = Record<
  StatusEffectType,
  ConventionEntry
>;

const ICON_PATHS = iconPathsJson as Record<string, string>;

// Validate that all ItemId and StatusEffectType values have convention entries
export const ALL_ITEMS = {
  ...basicItemsJson,
  ...poisonItemsJson,
} satisfies ItemConventionMap;

export const ALL_STATUS_EFFECTS = {
  ...basicStatusEffectsJson,
  ...poisonStatusEffectsJson,
  ...basicItemsJson,
  ...poisonItemsJson,
} satisfies StatusEffectConventionMap;

function resolveIconPath(iconName: string): string {
  const path = ICON_PATHS[iconName];
  if (path === undefined) {
    throw new Error(`Icon "${iconName}" not found in icon-paths.json`);
  }
  return path;
}

export const ItemConventionRegistry = {
  getItemDisplay(itemId: ItemId): ItemDisplayMetadata {
    const entry = this.getItemConvention(itemId);
    return {
      pathD: resolveIconPath(entry.icon),
      description: entry.description,
    };
  },

  getItemConvention(itemId: ItemId): ConventionEntry {
    const itemConfig = ALL_ITEMS[itemId];

    if (!itemConfig) {
      throw new Error(`No convention entry for item: ${itemId}`);
    }

    return itemConfig;
  },

  getStatusEffectDisplay(type: StatusEffectType): EffectDisplayMetadata {
    const effectConfig = ALL_STATUS_EFFECTS[type];

    if (!effectConfig) {
      throw new Error(`No convention entry for status effect: ${type}`);
    }

    return {
      pathD: resolveIconPath(effectConfig.icon),
      description: effectConfig.description,
    };
  },

  getActiveEffectDisplay(effectId: ActiveEffectId): EffectDisplayMetadata {
    const config = ACTIVE_EFFECT_DISPLAY_MAP[effectId];
    if (!config) {
      return {
        pathD: resolveIconPath('active-effect'),
        description: 'Unknown active effect',
      };
    }

    return {
      pathD: resolveIconPath(config.iconName),
      description: config.description,
    };
  },

  PASS_ICON_PATH: resolveIconPath('fast-forward-button'),

  resolveIconPath(iconName: string): string {
    return resolveIconPath(iconName);
  },
} as const;
