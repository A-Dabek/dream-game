import { ActiveEffectId } from '@dream/game-board';

export interface EffectDisplayMetadata {
  readonly name: string;
  readonly description: string;
}

export const ACTIVE_EFFECT_DISPLAY_MAP: Record<
  ActiveEffectId,
  {
    readonly name: string;
    readonly iconName: string;
    readonly description: string;
  }
> = {
  attack: {
    name: 'Attack',
    iconName: 'attack',
    description: 'Deals damage to the target',
  },
  heal: {
    name: 'Heal',
    iconName: 'heal',
    description: 'Restores health to the target',
  },
  modify_speed: {
    name: 'Modify Speed',
    iconName: 'modify-speed',
    description: "Changes a player's speed attribute",
  },
  remove_item: {
    name: 'Remove Item',
    iconName: 'remove-item',
    description: "Removes an item from a player's loadout",
  },
  add_status_effect: {
    name: 'Add Status Effect',
    iconName: 'add-status-effect',
    description: 'Applies a status effect to a player',
  },
};
