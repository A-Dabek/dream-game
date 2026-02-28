import { FirstAvailableStrategy, Strategy } from '../../ai';
import { Item, ItemId, Loadout } from '../../item';
import { getItemGenre } from '../../item-library';
import { PlayerRating } from '../../rating';
import { Player } from '../player.model';

const AVAILABLE_ITEM_IDS: ItemId[] = [
  'hand',
  'punch',
  'sticking_plaster',
  'sticky_boot',
  'wingfoot',
  'gas_grenade',
  '_blueprint_attack',
  '_blueprint_heal_5',
  '_blueprint_passive_attack',
  '_blueprint_reactive_removal',
  '_blueprint_self_damage',
  '_blueprint_damage_to_heal_charges',
  '_blueprint_damage_to_heal_permanent',
  '_blueprint_damage_to_heal_turns',
  '_dummy',
  '_blueprint_negate_damage',
  '_blueprint_triple_threat',
  'gas_mask',
  'antidote',
  'poison_drink',
  'poison_darts',
];

interface Defaults {
  HEALTH_MIN: number;
  HEALTH_MAX: number;
  SPEED_MIN: number;
  SPEED_MAX: number;
  ITEM_COUNT: number;
}

const DEFAULTS: Defaults = {
  HEALTH_MIN: 10,
  HEALTH_MAX: 15,
  SPEED_MIN: 5,
  SPEED_MAX: 10,
  ITEM_COUNT: 5,
};

/**
 * Builder for creating CPU players with configurable properties.
 *
 * Provides a fluent interface to configure health, speed, items, and strategy
 * before building the final Player object.
 *
 * Supports both random ranges (withRandomHealth, withRandomSpeed, withRandomItems)
 * and exact values (withHealth, withSpeed, withItems).
 */
export class CpuPlayerBuilder {
  private healthMin = DEFAULTS.HEALTH_MIN;
  private healthMax = DEFAULTS.HEALTH_MAX;
  private speedMin = DEFAULTS.SPEED_MIN;
  private speedMax = DEFAULTS.SPEED_MAX;
  private itemCount = DEFAULTS.ITEM_COUNT;
  private exactHealth: number | null = null;
  private exactSpeed: number | null = null;
  private exactItems: ItemId[] | null = null;
  private strategy: Strategy | null = null;

  constructor(
    readonly id: string,
    readonly name: string,
  ) {}

  /**
   * Sets random health within the given range (inclusive).
   */
  withRandomHealth(min: number, max: number): this {
    this.healthMin = Math.min(min, max);
    this.healthMax = Math.max(min, max);
    return this;
  }

  /**
   * Sets random speed within the given range (inclusive).
   */
  withRandomSpeed(min: number, max: number): this {
    this.speedMin = Math.min(min, max);
    this.speedMax = Math.max(min, max);
    return this;
  }

  /**
   * Sets the number of random items to include in the loadout.
   */
  withRandomItems(count: number): this {
    this.itemCount = Math.max(0, count);
    return this;
  }

  /**
   * Configures the player with FirstAvailableStrategy (leftmost item strategy).
   */
  withLeftMostStrategy(): this {
    this.strategy = new FirstAvailableStrategy();
    return this;
  }

  /**
   * Sets an exact health value.
   * Invalid values (non-positive) will fall back to random values within the configured range.
   */
  withHealth(health: number): this {
    this.exactHealth = health;
    return this;
  }

  /**
   * Sets an exact speed value.
   * Invalid values (non-positive) will fall back to random values within the configured range.
   */
  withSpeed(speed: number): this {
    this.exactSpeed = speed;
    return this;
  }

  /**
   * Sets exact items by their ItemIds.
   * Invalid ItemIds are filtered out and won't appear in the loadout.
   */
  withItems(itemIds: ItemId[]): this {
    this.exactItems = itemIds;
    return this;
  }

  /**
   * Applies a PlayerConfig to this builder.
   * This method provides a convenient way to configure the player from a structured config object.
   * Invalid values in the config gracefully fall back to defaults.
   */
  withConfig(config: PlayerConfig): this {
    if (config.items !== undefined) {
      this.withItems(config.items);
    }
    if (config.health !== undefined) {
      this.withHealth(config.health);
    }
    if (config.speed !== undefined) {
      this.withSpeed(config.speed);
    }
    return this;
  }

  /**
   * Builds and returns the configured Player object.
   *
   * @throws Error if no strategy has been configured.
   */
  build(): Player {
    if (!this.strategy) {
      throw new Error(
        'Strategy must be configured before building. Use .withLeftMostStrategy()',
      );
    }

    const items = this.generateItems();
    const health = this.resolveHealth();
    const speed = this.resolveSpeed();

    const loadout: Loadout = {
      health,
      speed,
      items,
    };

    return {
      id: this.id,
      name: this.name,
      rating: new PlayerRating(),
      strategy: this.strategy,
      loadout,
    };
  }

  private generateItems(): Item[] {
    // Use exact items if configured
    if (this.exactItems !== null) {
      const validItemIds = this.filterValidItemIds(this.exactItems);
      return validItemIds.map((id, i) => ({
        id,
        instanceId: `${this.id}-item-${i}`,
        genre: getItemGenre(id),
      }));
    }

    // Fall back to random items
    const availableItemIds = AVAILABLE_ITEM_IDS;
    return Array.from({ length: this.itemCount }, (_, i) => {
      const id =
        availableItemIds[Math.floor(Math.random() * availableItemIds.length)];
      return {
        id,
        instanceId: `${this.id}-item-${i}`,
        genre: getItemGenre(id),
      };
    });
  }

  private filterValidItemIds(itemIds: ItemId[]): ItemId[] {
    const validIds = AVAILABLE_ITEM_IDS;
    return itemIds.filter((id) => validIds.includes(id));
  }

  private resolveHealth(): number {
    // Use exact health if valid (positive)
    if (this.exactHealth !== null && this.exactHealth > 0) {
      return this.exactHealth;
    }
    // Fall back to random value
    return this.generateRandomValue(this.healthMin, this.healthMax);
  }

  private resolveSpeed(): number {
    // Use exact speed if valid (positive)
    if (this.exactSpeed !== null && this.exactSpeed > 0) {
      return this.exactSpeed;
    }
    // Fall back to random value
    return this.generateRandomValue(this.speedMin, this.speedMax);
  }

  private generateRandomValue(min: number, max: number): number {
    const range = max - min + 1;
    return Math.floor(Math.random() * range) + min;
  }
}

export interface PlayerConfig {
  items?: ItemId[];
  health?: number;
  speed?: number;
}

export interface GamePlayersConfig {
  player1?: PlayerConfig;
  player2?: PlayerConfig;
}
