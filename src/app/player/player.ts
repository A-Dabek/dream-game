import { CpuPlayerBuilder } from './impl/cpu-player-builder';
import { Player } from './player.model';

/**
 * Factory function to create a random CPU player with default settings.
 *
 * @param id Unique identifier for the player.
 * @param name Name of the player.
 * @returns A new Player object configured as a CPU with default random values.
 */
export function createCpuPlayer(id: string, name: string): Player {
  return new CpuPlayerBuilder(id, name)
    .withRandomHealth(10, 15)
    .withRandomSpeed(5, 10)
    .withRandomItems(1)
    .withLeftMostStrategy()
    .build();
}
