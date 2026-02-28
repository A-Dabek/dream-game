import { ActiveEffectId } from '@dream/game-board';

export interface EffectDisplayMetadata {
  readonly pathD: string;
  readonly description: string;
}

export const ACTIVE_EFFECT_DISPLAY_MAP: Record<
  ActiveEffectId,
  { readonly iconName: string; readonly description: string }
> = {
  attack: {
    iconName: 'attack',
    description: 'Deals damage to the target',
  },
  heal: {
    iconName: 'heal',
    description: 'Restores health to the target',
  },
  modify_speed: {
    iconName: 'modify-speed',
    description: "Changes a player's speed attribute",
  },
  remove_item: {
    iconName: 'remove-item',
    description: "Removes an item from a player's loadout",
  },
  add_status_effect: {
    iconName: 'add-status-effect',
    description: 'Applies a status effect to a player',
  },
};
