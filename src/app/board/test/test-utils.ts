import {BoardLoadout} from '../board.model';

/**
 * Creates a mock player loadout for testing purposes.
 */
export function createMockPlayer(id: string, overrides: Partial<BoardLoadout> = {}): BoardLoadout {
  return {
    id,
    health: 100,
    speed: 1,
    items: [{id: '_blueprint_attack'}],
    ...overrides,
  };
}
