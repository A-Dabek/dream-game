import {
  ItemId,
  StatusEffectType,
  ActiveEffectId,
  Genre,
  getItemGenre,
} from '@dream/game-board';
import {
  ACTIVE_EFFECT_DISPLAY_MAP,
  EffectDisplayMetadata,
} from '../common/active-effect-display-map';

import basicItemsJson from './basic-items.json';
import basicStatusEffectsJson from './basic-status-effects.json';
import poisonItemsJson from './poison-items.json';
import poisonStatusEffectsJson from './poison-status-effects.json';

export interface ItemDisplayMetadata {
  readonly iconName: string;
  readonly description: string;
}

interface GenreConfig {
  readonly items: Record<
    string,
    { readonly icon?: string; readonly description?: string }
  >;
  readonly statusEffects: Record<
    string,
    { readonly icon?: string; readonly description?: string }
  >;
}

const GENRE_CONFIGS: Record<Genre, GenreConfig> = {
  basic: {
    items: basicItemsJson,
    statusEffects: basicStatusEffectsJson,
  },
  poison: {
    items: poisonItemsJson,
    statusEffects: poisonStatusEffectsJson,
  },
} as const;

function toKebabCase(id: string): string {
  return id
    .replace(/^_/, '')
    .replace('blueprint_', '')
    .replace(/_/g, '-')
    .trim();
}

function deriveDescription(id: string): string {
  return id.replace('_blueprint_', '').replace(/_/g, ' ');
}

export const ItemConventionRegistry = {
  getItemDisplay(itemId: ItemId): ItemDisplayMetadata {
    const genre = getItemGenre(itemId);
    const config = GENRE_CONFIGS[genre];
    const itemConfig = config?.items?.[itemId];

    return {
      iconName: itemConfig?.icon ?? toKebabCase(itemId),
      description: itemConfig?.description ?? deriveDescription(itemId),
    };
  },

  getStatusEffectDisplay(type: StatusEffectType): EffectDisplayMetadata {
    // 1. Check for explicit overrides in any genre configuration
    for (const genreConfig of Object.values(GENRE_CONFIGS)) {
      const effectConfig = genreConfig.statusEffects?.[type];
      if (effectConfig) {
        return {
          iconName: effectConfig.icon ?? toKebabCase(type),
          description: effectConfig.description ?? deriveDescription(type),
        };
      }
    }

    // 2. Fallback to item display metadata if it matches an ItemId
    for (const genreConfig of Object.values(GENRE_CONFIGS)) {
      if (type in genreConfig.items) {
        return this.getItemDisplay(type as ItemId);
      }
    }

    // 3. Finally derive from naming conventions
    return {
      iconName: toKebabCase(type),
      description: deriveDescription(type),
    };
  },

  getActiveEffectDisplay(effectId: ActiveEffectId): EffectDisplayMetadata {
    return (
      ACTIVE_EFFECT_DISPLAY_MAP[effectId] ?? {
        iconName: 'active-effect',
        description: 'Unknown active effect',
      }
    );
  },

  PASS_ICON_NAME: 'fast-forward-button' as const,
} as const;
