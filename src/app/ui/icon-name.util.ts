export const PASS_ICON_NAME = 'fast-forward-button';

/** Converts an item ID (with optional `_blueprint_` prefix) into the matching icon name. */
export function iconNameFromItemId(itemId: string): string {
  if (itemId.startsWith('_blueprint_')) {
    return itemId.replace('_blueprint_', '').replace(/_/g, '-');
  }

  return itemId.replace(/_/g, '-');
}
