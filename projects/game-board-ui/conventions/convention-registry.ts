import {
  StaticItemId,
  StaticStatusEffectType,
  ItemId,
  StatusEffectType,
  ActiveEffectId,
  Effect,
  PassiveEffect,
} from '@dream/game-board';
import {
  ACTIVE_EFFECT_DISPLAY_MAP,
  EffectDisplayMetadata,
} from '../common/active-effect-display-map';

import iconPathsJson from './icon-paths.json';
import basicItemsJson from './basic-items.json';
import basicStatusEffectsJson from './basic-status-effects.json';
import poisonItemsJson from './poison-items.json';
import poisonStatusEffectsJson from './poison-status-effects.json';
import doctorItemsJson from './doctor-items.json';
import doctorStatusEffectsJson from './doctor-status-effects.json';

export interface ItemDisplayMetadata {
  readonly pathD: string;
  readonly description: string;
}

export type IconName = keyof typeof iconPathsJson;

export interface ConventionEntry {
  readonly icon: string;
  readonly description: string;
}

export type StaticItemConventionMap = Record<StaticItemId, ConventionEntry>;
export type StaticStatusEffectConventionMap = Record<
  StaticStatusEffectType,
  ConventionEntry
>;

const ICON_PATHS = iconPathsJson as Record<string, string>;

// Validate that all ItemId and StatusEffectType values have convention entries
export const ALL_ITEMS = {
  ...basicItemsJson,
  ...poisonItemsJson,
  ...doctorItemsJson,
} satisfies StaticItemConventionMap;

export const ALL_STATUS_EFFECTS = {
  ...basicStatusEffectsJson,
  ...poisonStatusEffectsJson,
  ...doctorStatusEffectsJson,
  ...basicItemsJson,
  ...poisonItemsJson,
  ...doctorItemsJson,
} satisfies StaticStatusEffectConventionMap;

const dynamicItemConventions = new Map<string, ConventionEntry>();
const dynamicStatusEffectConventions = new Map<string, ConventionEntry>();

export function registerItemConvention(
  id: string,
  entry: ConventionEntry,
): void {
  dynamicItemConventions.set(id, entry);
}

export function registerStatusEffectConvention(
  id: string,
  entry: ConventionEntry,
): void {
  dynamicStatusEffectConventions.set(id, entry);
}

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
    const staticEntry = ALL_ITEMS[itemId as keyof typeof ALL_ITEMS];
    if (staticEntry) {
      return staticEntry;
    }

    const dynamicEntry = dynamicItemConventions.get(itemId);
    if (dynamicEntry) {
      return dynamicEntry;
    }

    return {
      icon: 'uncertainty',
      description: this.formatItemIdAsName(itemId),
    };
  },

  getStatusEffectDisplay(type: StatusEffectType): EffectDisplayMetadata {
    const staticEntry =
      ALL_STATUS_EFFECTS[type as keyof typeof ALL_STATUS_EFFECTS];
    if (staticEntry) {
      return {
        pathD: resolveIconPath(staticEntry.icon),
        description: staticEntry.description,
      };
    }

    const dynamicEntry = dynamicStatusEffectConventions.get(type);
    if (dynamicEntry) {
      return {
        pathD: resolveIconPath(dynamicEntry.icon),
        description: dynamicEntry.description,
      };
    }

    return {
      pathD: resolveIconPath('uncertainty'),
      description: this.formatItemIdAsName(type),
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

  formatItemIdAsName(itemId: string): string {
    return itemId
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },
} as const;

export function generateDescriptionFromEffects(
  onPlayEffects: Effect[],
  passiveEffects?: PassiveEffect[],
): string {
  const parts: string[] = [];

  for (const effect of onPlayEffects) {
    parts.push(effectTypeToDescription(effect));
  }

  if (passiveEffects?.length) {
    parts.push(
      `${passiveEffects.length} passive effect${
        passiveEffects.length > 1 ? 's' : ''
      }`,
    );
  }

  return parts.join('. ') || 'No effects';
}

function effectTypeToDescription(effect: Effect): string {
  switch (effect.type) {
    case 'damage':
      return `Deals ${effect.value} damage`;
    case 'healing':
      return `Heals ${effect.value} health`;
    case 'speed_up':
      return `Increases speed by ${effect.value}`;
    case 'slow_down':
      return `Decreases speed by ${Math.abs(Number(effect.value))}`;
    case 'add_status_effect':
      return 'Applies a status effect';
    case 'remove_item':
      return 'Removes an item';
    default:
      return effect.type.replace(/_/g, ' ');
  }
}
