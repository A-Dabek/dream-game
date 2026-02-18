import { Item, ItemId } from '../../item';
import { getItemGenre } from '../../item-library';
import { BoardLoadout } from '../board.model';

/**
 * Creates a test item with the given ID and its associated genre.
 */
export function createTestItem(id: ItemId): Item {
  return { id, genre: getItemGenre(id) };
}

/**
 * Input items can be either:
 * - ItemId[]: ['_blueprint_attack', '_blueprint_heal_5'] (simplified, genre looked up from registry)
 * - Item[]: [{ id: '_blueprint_attack', genre: 'basic' }] (full objects)
 */
export type TestItemInput = ItemId[] | Item[];

/**
 * Converts an array of item IDs to full Item objects with genre from registry.
 */
function convertItemIdsToItems(itemIds: ItemId[]): Item[] {
  return itemIds.map((id) => createTestItem(id));
}

/**
 * Normalizes items parameter to an array of Item objects.
 */
function normalizeItems(items: TestItemInput | undefined): Item[] {
  if (items === undefined) {
    return [createTestItem('_blueprint_attack')];
  }

  // Check if it's an array of strings (ItemId[])
  if (items.length > 0 && typeof items[0] === 'string') {
    return convertItemIdsToItems(items as ItemId[]);
  }

  // It's already Item[]
  return items as Item[];
}

/**
 * Overrides for mock player creation.
 */
export interface MockPlayerOverrides {
  health?: number;
  speed?: number;
  items?: TestItemInput;
  [key: string]: unknown;
}

/**
 * Creates a mock player loadout for testing purposes.
 * Items can be specified as either:
 * - ItemId[]: ['_blueprint_attack', '_blueprint_heal_5'] (simplified, genre determined by itemId)
 * - Item[]: [{ id: '_blueprint_attack' }] (full objects, genre determined by itemId)
 *
 * @example
 * // Simple usage with item IDs
 * createMockPlayer('p1', { items: ['_blueprint_attack', '_blueprint_heal_5'] })
 *
 * @example
 * // With mixed overrides
 * createMockPlayer('p1', { speed: 10, items: ['_blueprint_attack'] })
 *
 * @example
 * // Backward compatible with full Item objects
 * createMockPlayer('p1', { items: [{ id: '_blueprint_attack' }] })
 */
export function createMockPlayer(
  id: string,
  overrides: MockPlayerOverrides = {},
): BoardLoadout {
  const normalizedItems = normalizeItems(overrides.items);

  // Ensure dummy item is present to prevent fatigue damage in tests
  const items = normalizedItems.some((i) => i.id === '_dummy')
    ? normalizedItems
    : [...normalizedItems, createTestItem('_dummy')];

  return {
    id,
    health: 100,
    speed: 1,
    ...overrides,
    items,
  };
}
