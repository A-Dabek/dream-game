import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  GamePlayersConfig,
  isRegisteredItemId,
  ItemId,
  PlayerConfig,
} from '@dream/game-board';

/**
 * Service for parsing game configuration from URL query parameters.
 *
 * This service reads the 'state' query parameter and converts it to a
 * GamePlayersConfig object that can be passed to the player creation functions.
 *
 * URL Format:
 * ?state=<player1_items>|<player1_health>|<player1_speed>;<player2_items>|<player2_health>|<player2_speed>
 *
 * Example:
 * ?state=punch,sticking_plaster|20|10;wingfoot|15|8
 *
 * - player_items: comma-separated ItemId values
 * - player_health: numeric value
 * - player_speed: numeric value
 * - Players separated by semicolon (;)
 * - Fields separated by pipe (|)
 */
@Injectable({
  providedIn: 'root',
})
export class UrlGameConfigService {
  private readonly document = inject(DOCUMENT);

  /**
   * Parses the URL query parameters and returns a GamePlayersConfig.
   * Returns undefined if no state parameter is present or if parsing fails.
   *
   * Reads from document.location.search to ensure URL params are available
   * immediately, avoiding timing issues with ActivatedRoute.
   *
   * @returns GamePlayersConfig if valid state param exists, undefined otherwise
   */
  parseConfigFromUrl(): GamePlayersConfig | undefined {
    const urlParams = new URLSearchParams(this.document.location.search);
    const stateParam = urlParams.get('state');

    if (!stateParam) {
      return undefined;
    }

    try {
      return this.parseStateString(stateParam);
    } catch (error) {
      // Gracefully handle malformed URLs by returning undefined
      console.warn('[UrlGameConfig] Failed to parse state parameter:', error);
      return undefined;
    }
  }

  /**
   * Parses the state string into a GamePlayersConfig.
   *
   * @param state The state string from URL
   * @returns GamePlayersConfig object
   * @throws Error if format is invalid
   */
  private parseStateString(state: string): GamePlayersConfig {
    // Split by semicolon to get player configs
    const [player1Str, player2Str, ...extra] = state.split(';');

    if (extra.length > 0) {
      throw new Error(
        'Invalid state format: expected 1-2 players separated by ;',
      );
    }

    const config: GamePlayersConfig = {};

    if (player1Str) {
      config.player1 = this.parsePlayerConfig(player1Str);
    }

    if (player2Str) {
      config.player2 = this.parsePlayerConfig(player2Str);
    }

    return config;
  }

  /**
   * Parses a single player configuration string.
   *
   * Format: items|health|speed
   * Example: punch,sticking_plaster|20|10
   *
   * @param playerStr The player config string
   * @returns PlayerConfig object
   */
  private parsePlayerConfig(playerStr: string): PlayerConfig {
    const parts = playerStr.split('|');

    if (parts.length !== 3) {
      throw new Error('Invalid player format: expected items|health|speed');
    }

    const [itemsStr, healthStr, speedStr] = parts;

    const items = this.parseItems(itemsStr);
    const health = this.parsePositiveInt(healthStr);
    const speed = this.parsePositiveInt(speedStr);

    return {
      ...(items.length > 0 ? { items } : {}),
      ...(health !== undefined ? { health } : {}),
      ...(speed !== undefined ? { speed } : {}),
    };
  }

  private parseItems(itemsStr: string): ItemId[] {
    if (!itemsStr) return [];
    return itemsStr
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
      .filter((id) => isRegisteredItemId(id)) as ItemId[];
  }

  private parsePositiveInt(valueStr: string): number | undefined {
    const value = parseInt(valueStr, 10);
    return isNaN(value) || value <= 0 ? undefined : value;
  }
}
