import { BoardLoadout } from '../board.model';

/**
 * Creates a mock player loadout for testing purposes.
 */
export function createMockPlayer(
  id: string,
  overrides: Partial<BoardLoadout> = {},
): BoardLoadout {
  let items = overrides.items ?? [{ id: '_blueprint_attack' }];

  // Ensure dummy item is present to prevent fatigue damage in tests
  if (!items.some((i) => i.id === '_dummy')) {
    items = [...items, { id: '_dummy' }];
  }

  return {
    id,
    health: 100,
    speed: 1,
    ...overrides,
    items,
  };
}
