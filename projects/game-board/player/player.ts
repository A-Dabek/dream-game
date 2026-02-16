import {
  CpuPlayerBuilder,
  GamePlayersConfig,
  PlayerConfig,
} from './impl/cpu-player-builder';
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

/**
 * Creates a CPU player with custom configuration.
 * Invalid values in the config gracefully fall back to defaults.
 *
 * @param id Unique identifier for the player.
 * @param name Name of the player.
 * @param config Configuration object specifying items, health, and speed.
 * @returns A new Player object configured according to the provided config.
 *
 * @example
 * ```typescript
 * const player = createCpuPlayerWithConfig('cpu-1', 'Bot', {
 *   items: ['punch', 'sticking_plaster'],
 *   health: 25,
 *   speed: 8
 * });
 * ```
 */
export function createCpuPlayerWithConfig(
  id: string,
  name: string,
  config: PlayerConfig,
): Player {
  return new CpuPlayerBuilder(id, name)
    .withConfig(config)
    .withLeftMostStrategy()
    .build();
}

/**
 * Creates both players for a game from a configuration object.
 * When no config is provided or values are invalid, falls back to defaults.
 *
 * @param config Configuration for both players. Undefined players use defaults.
 * @returns An object containing both configured players.
 *
 * @example
 * ```typescript
 * const { player1, player2 } = createGamePlayers({
 *   player1: { items: ['punch', 'wingfoot'], health: 20, speed: 10 },
 *   player2: { items: ['sticky_boot'], health: 15, speed: 5 }
 * });
 * ```
 */
export function createGamePlayers(config: GamePlayersConfig = {}): {
  player1: Player;
  player2: Player;
} {
  const player1 = config.player1
    ? createCpuPlayerWithConfig('player-1', 'Player 1', config.player1)
    : createCpuPlayer('player-1', 'Player 1');

  const player2 = config.player2
    ? createCpuPlayerWithConfig('player-2', 'Player 2', config.player2)
    : createCpuPlayer('player-2', 'Player 2');

  return { player1, player2 };
}
