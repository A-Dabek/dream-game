import { Player } from './player.model';
import { PlayerRating } from '../rating';
import { FirstAvailableStrategy } from '../ai';
import { ItemId, Loadout } from '../item';

/**
 * Factory function to create a random CPU player.
 *
 * @param id Unique identifier for the player.
 * @param name Name of the player.
 * @returns A new Player object configured as a CPU.
 */
export function createCpuPlayer(id: string, name: string): Player {
  const availableItemIds: ItemId[] = [
    '_blueprint_attack',
    '_blueprint_passive_attack',
    '_blueprint_reactive_removal',
    '_blueprint_damage_to_heal_charges',
    '_blueprint_damage_to_heal_turns',
    '_blueprint_damage_to_heal_permanent',
    '_blueprint_self_damage',
    '_blueprint_negate_damage',
    '_blueprint_triple_threat',
  ];

  const items = Array.from({ length: 5 }, (_, i) => ({
    id: availableItemIds[Math.floor(Math.random() * availableItemIds.length)],
    instanceId: `${id}-item-${i}`,
  }));

  const loadout: Loadout = {
    health: Math.floor(Math.random() * 6) + 10, // Drastically reduced health for testing (10-15)
    speed: Math.floor(Math.random() * 6) + 5, // Randomized speed between 5 and 10
    items,
  };

  return {
    id,
    name,
    rating: new PlayerRating(),
    strategy: new FirstAvailableStrategy(),
    loadout,
  };
}
