import { Injectable } from '@angular/core';
import { GamePlayersConfig, PlayerConfig } from '@dream/player';
import { ItemId } from '@dream/item';

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
  /**
   * Parses the URL query parameters and returns a GamePlayersConfig.
   * Returns undefined if no state parameter is present or if parsing fails.
   *
   * Reads directly from window.location.search to ensure URL params are available
   * immediately, avoiding timing issues with ActivatedRoute.
   *
   * @returns GamePlayersConfig if valid state param exists, undefined otherwise
   */
  parseConfigFromUrl(): GamePlayersConfig | undefined {
    // Read directly from window.location.search to avoid timing issues with ActivatedRoute
    const urlParams = new URLSearchParams(window.location.search);
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
    const playerParts = state.split(';');

    if (playerParts.length === 0 || playerParts.length > 2) {
      throw new Error(
        'Invalid state format: expected 1-2 players separated by ;',
      );
    }

    const config: GamePlayersConfig = {};

    // Parse player 1
    if (playerParts[0]) {
      config.player1 = this.parsePlayerConfig(playerParts[0]);
    }

    // Parse player 2
    if (playerParts[1]) {
      config.player2 = this.parsePlayerConfig(playerParts[1]);
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

    // Parse items (comma-separated ItemIds)
    const items = itemsStr
      ? (itemsStr.split(',').filter((id) => id.trim() !== '') as ItemId[])
      : [];

    // Parse health
    const health = parseInt(healthStr, 10);
    const healthValue = isNaN(health) || health <= 0 ? undefined : health;

    // Parse speed
    const speed = parseInt(speedStr, 10);
    const speedValue = isNaN(speed) || speed <= 0 ? undefined : speed;

    const config: PlayerConfig = {};

    if (items.length > 0) {
      config.items = items;
    }
    if (healthValue !== undefined) {
      config.health = healthValue;
    }
    if (speedValue !== undefined) {
      config.speed = speedValue;
    }

    return config;
  }
}
