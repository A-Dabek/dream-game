import { PlayerConfig } from '@dream/game-board';

// Default human player configuration
export const DEFAULT_HUMAN_CONFIG: PlayerConfig = {
  items: [
    'gas_grenade',
    'gas_mask',
    'poison_darts',
    'poison_drink',
    'antidote',
  ],
  health: 200,
  speed: 8,
};

// Default CPU player configuration
export const DEFAULT_CPU_CONFIG: PlayerConfig = {
  items: ['punch', 'sticking_plaster', 'wingfoot', 'sticky_boot'],
  health: 180,
  speed: 7,
};
