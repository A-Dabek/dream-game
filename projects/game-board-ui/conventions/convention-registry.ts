import {
  StaticItemId,
  StaticStatusEffectType,
  ItemId,
  StatusEffectType,
  ActiveEffectId,
  Effect,
  PassiveEffect,
} from '@dream/game-board';
import { ICON_NAMES, IconName } from '@dream/shared-basic';
import { ACTIVE_EFFECT_DISPLAY_MAP, EffectDisplayMetadata } from '../common';

import basicItemsJson from './basic-items.json';
import basicStatusEffectsJson from './basic-status-effects.json';
import poisonItemsJson from './poison-items.json';
import poisonStatusEffectsJson from './poison-status-effects.json';
import doctorItemsJson from './doctor-items.json';
import doctorStatusEffectsJson from './doctor-status-effects.json';

// FIXME too little encapsulation in this entire file
export interface ItemDisplayMetadata {
  readonly name: string;
  readonly description: string;
}

export interface ConventionEntry {
  readonly name: string;
  readonly icon: IconName;
  readonly description: string;
}

export type StaticItemConventionMap = Record<StaticItemId, ConventionEntry>;
export type StaticStatusEffectConventionMap = Record<
  StaticStatusEffectType,
  ConventionEntry
>;

const dynamicIconPaths = new Map<string, string>();

// Validate that all ItemId and StatusEffectType values have convention entries
export const ALL_ITEMS = {
  ...basicItemsJson,
  ...poisonItemsJson,
  ...doctorItemsJson,
} as unknown as StaticItemConventionMap;

export const ALL_STATUS_EFFECTS = {
  ...basicStatusEffectsJson,
  ...poisonStatusEffectsJson,
  ...doctorStatusEffectsJson,
  ...basicItemsJson,
  ...poisonItemsJson,
  ...doctorItemsJson,
} as unknown as StaticStatusEffectConventionMap;

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

export function hasIcon(iconName: string): boolean {
  return dynamicIconPaths.has(iconName);
}

export function getAvailableIconNames(): string[] {
  const dynamicIcons = Array.from(dynamicIconPaths.keys());
  return [...new Set([...ICON_NAMES, ...dynamicIcons])];
}

export const ItemConventionRegistry = {
  getItemDisplay(itemId: ItemId): ItemDisplayMetadata {
    const entry = this.getItemConvention(itemId);
    return {
      name: entry.name,
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
      name: this.formatItemIdAsName(itemId),
      icon: 'uncertainty',
      description: this.formatItemIdAsName(itemId),
    };
  },

  getStatusEffectConvention(type: StatusEffectType): ConventionEntry {
    const staticEntry =
      ALL_STATUS_EFFECTS[type as keyof typeof ALL_STATUS_EFFECTS];
    if (staticEntry) {
      return staticEntry;
    }

    const dynamicEntry = dynamicStatusEffectConventions.get(type);
    if (dynamicEntry) {
      return dynamicEntry;
    }

    return {
      name: this.formatItemIdAsName(type),
      icon: 'uncertainty',
      description: this.formatItemIdAsName(type),
    };
  },

  getStatusEffectDisplay(type: StatusEffectType): EffectDisplayMetadata {
    const staticEntry =
      ALL_STATUS_EFFECTS[type as keyof typeof ALL_STATUS_EFFECTS];
    if (staticEntry) {
      return {
        name: staticEntry.name,
        description: staticEntry.description,
      };
    }

    const dynamicEntry = dynamicStatusEffectConventions.get(type);
    if (dynamicEntry) {
      return {
        name: dynamicEntry.name,
        description: dynamicEntry.description,
      };
    }

    return {
      name: this.formatItemIdAsName(type),
      description: this.formatItemIdAsName(type),
    };
  },

  getActiveEffectDisplay(effectId: ActiveEffectId): EffectDisplayMetadata {
    const config = ACTIVE_EFFECT_DISPLAY_MAP[effectId];
    if (!config) {
      return {
        name: this.formatItemIdAsName(effectId),
        description: 'Unknown active effect',
      };
    }

    return {
      name: config.name,
      description: config.description,
    };
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
