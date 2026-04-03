import { PlayerConfig } from '@dream/game-board';

// Default human player configuration
export const DEFAULT_HUMAN_CONFIG: PlayerConfig = {
  items: ['drip', 'poison_darts', 'stitches'],
  speed: 8,
};

// Default CPU player configuration
export const DEFAULT_CPU_CONFIG: PlayerConfig = {
  items: [
    'poison_darts',
    'punch',
    'sticking_plaster',
    'wingfoot',
    'sticky_boot',
  ],
  speed: 7,
};
