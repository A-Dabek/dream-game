import { PlayerConfig } from '@dream/game-board';

// Default human player configuration
export const DEFAULT_HUMAN_CONFIG: PlayerConfig = {
  items: [
    '_blueprint_attack',
    '_blueprint_attack',
    '_blueprint_attack',
    '_blueprint_attack',
  ],
  health: 20,
  speed: 8,
};

// Default CPU player configuration
export const DEFAULT_CPU_CONFIG: PlayerConfig = {
  items: ['punch', 'sticking_plaster', 'wingfoot', 'sticky_boot'],
  health: 18,
  speed: 7,
};
