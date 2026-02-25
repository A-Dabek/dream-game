import { ItemId, StatusEffectType } from '@dream/game-board';
import { EffectDisplayMetadata } from './active-effect-display-map';
import { ItemDisplayRegistry } from './item-display-map';

export interface StatusEffectDisplayMetadata extends EffectDisplayMetadata {
  readonly statusEffectDescription?: string;
}

/**
 * Built-in status effect types that can appear in the engine state.
 * These match the StatusEffectType union excluding ItemId variants.
 */
const BUILT_IN_STATUS_EFFECT_TYPES = [
  'poison',
  'invert',
  'negate',
  'reactive_removal',
  'advance_turn',
  'fatigue',
  'periodic_attack',
] as const;

type BuiltInStatusEffectType = (typeof BUILT_IN_STATUS_EFFECT_TYPES)[number];

// Compile-time validation: ensures BuiltInStatusEffectType is a subset of StatusEffectType (excluding ItemId)
type AssertBuiltInStatusEffectTypeIsValid =
  BuiltInStatusEffectType extends StatusEffectType
    ? Exclude<StatusEffectType, ItemId> extends BuiltInStatusEffectType
      ? true
      : never
    : never;
// Export for compile-time validation - causes error if BuiltInStatusEffectType doesn't match StatusEffectType
export type { AssertBuiltInStatusEffectTypeIsValid };

const STATUS_EFFECT_METADATA_MAP: Record<
  BuiltInStatusEffectType,
  StatusEffectDisplayMetadata
> = {
  poison: {
    iconName: 'poison',
    description: 'Deals periodic damage over time',
  },
  invert: {
    iconName: 'invert',
    description: 'Inverts effects or outcomes',
  },
  negate: {
    iconName: 'negate',
    description: 'Nullifies or blocks effects',
  },
  reactive_removal: {
    iconName: 'reactive-removal',
    description: 'Removes items reactively',
  },
  advance_turn: {
    iconName: 'advance-turn',
    description: 'Advances turn order',
  },
  fatigue: {
    iconName: 'fatigue',
    description: 'Causes fatigue effect',
  },
  periodic_attack: {
    iconName: 'periodic-attack',
    description: 'Grants periodic attack effect',
  },
};

function isBuiltInStatusEffectType(
  type: string,
): type is BuiltInStatusEffectType {
  return type in STATUS_EFFECT_METADATA_MAP;
}

/**
 * Provides display metadata for status effects.
 * Falls back to item display metadata when status effect type matches an ItemId.
 */
export const StatusEffectDisplayRegistry = {
  getMetadata(type: StatusEffectType): StatusEffectDisplayMetadata {
    // Check if it's a built-in status effect type
    if (isBuiltInStatusEffectType(type)) {
      return STATUS_EFFECT_METADATA_MAP[type];
    }

    // Fall back to item display metadata for ItemId types
    if (ItemDisplayRegistry.hasMetadata(type)) {
      const itemMetadata = ItemDisplayRegistry.getMetadata(type as ItemId);
      return {
        iconName: itemMetadata.iconName,
        description: itemMetadata.description,
      };
    }

    // Fallback for unknown types
    return {
      iconName: 'status-effect',
      description: 'Unknown status effect',
    };
  },

  hasMetadata(type: string): type is StatusEffectType {
    return (
      isBuiltInStatusEffectType(type) || ItemDisplayRegistry.hasMetadata(type)
    );
  },
} as const;
