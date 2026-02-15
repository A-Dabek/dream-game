export type { Player } from './player.model';
export type {
  PlayerConfig,
  GamePlayersConfig,
} from './impl/cpu-player-builder';
export {
  createCpuPlayer,
  createCpuPlayerWithConfig,
  createGamePlayers,
} from './player';
export { CpuPlayerBuilder } from './impl/cpu-player-builder';
