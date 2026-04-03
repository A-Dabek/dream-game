import { FirstAvailableStrategy, Strategy } from '../../ai';
import { biasedRoll } from '../../utils/biased-roll';
import { Item, ItemId, Loadout } from '../../item';
import { getItemBehavior, getItemGenre, ItemLibrary } from '../../item-library';
import { PlayerRating } from '../../rating';
import { Player } from '../player.model';

const AVAILABLE_ITEM_IDS: ItemId[] = (
  Object.keys(ItemLibrary) as ItemId[]
).filter((id) => id !== '_blueprint_damage_to_heal_permanent'); // TODO this item is unbalanced, it causes games to never finish

const DEFAULT_ITEM_COUNT = 5;

/**
 * Builder for creating CPU players with configurable properties.
 *
 * Health and speed are coupled: each item contributes a biased roll to health,
 * and the same roll contributes (5 - roll) to speed.
 */
export class CpuPlayerBuilder {
  private healthMin: number;
  private healthMax: number;
  private healthMean: number | null = null;
  private healthStdDev: number | null = null;
  private healthLimitMin: number;

  private speedMin: number;
  private speedMax: number;
  private speedMean: number | null = null;
  private speedStdDev: number | null = null;
  private speedLimitMin: number;

  private itemCount = DEFAULT_ITEM_COUNT;
  private itemCountMin: number | null = null;
  private itemCountMax: number | null = null;

  private exactHealth: number | null = null;
  private exactSpeed: number | null = null;
  private exactItems: ItemId[] | null = null;
  private strategy: Strategy | null = null;

  constructor(
    readonly id: string,
    readonly name: string,
  ) {
    this.healthMin = 10;
    this.healthMax = 15;
    this.healthLimitMin = 10;
    this.speedMin = 5;
    this.speedMax = 10;
    this.speedLimitMin = 1;
  }

  /**
   * Sets random health within the given range (inclusive).
   */
  withRandomHealth(min: number, max: number): this {
    this.healthMin = Math.min(min, max);
    this.healthMax = Math.max(min, max);
    this.healthMean = null;
    return this;
  }

  /**
   * Sets random health using normal distribution.
   */
  withNormalHealth(mean: number, stdDev: number, min: number = 10): this {
    this.healthMean = mean;
    this.healthStdDev = stdDev;
    this.healthLimitMin = min;
    return this;
  }

  /**
   * Sets random speed within the given range (inclusive).
   */
  withRandomSpeed(min: number, max: number): this {
    this.speedMin = Math.min(min, max);
    this.speedMax = Math.max(min, max);
    this.speedMean = null;
    return this;
  }

  /**
   * Sets random speed using normal distribution.
   */
  withNormalSpeed(mean: number, stdDev: number, min: number = 1): this {
    this.speedMean = mean;
    this.speedStdDev = stdDev;
    this.speedLimitMin = min;
    return this;
  }

  /**
   * Sets the number of random items to include in the loadout.
   */
  withRandomItems(count: number): this {
    this.itemCount = Math.max(0, count);
    this.itemCountMin = null;
    this.itemCountMax = null;
    return this;
  }

  /**
   * Sets a range for the number of random items to include in the loadout.
   */
  withRandomItemsInRange(min: number, max: number): this {
    this.itemCountMin = Math.min(min, max);
    this.itemCountMax = Math.max(min, max);
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
    const health =
      this.exactHealth !== null && this.exactHealth > 0
        ? this.exactHealth
        : this.resolveHealth();
    const biasedSpeed = this.resolveBiasedSpeed(items.length);
    const speed =
      this.exactSpeed !== null && this.exactSpeed > 0
        ? this.exactSpeed
        : this.resolveSpeed(biasedSpeed);

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
        remainingUsages: getItemBehavior(id).usages ?? 1,
      }));
    }

    // Fall back to random items
    const availableItemIds = AVAILABLE_ITEM_IDS;
    const count =
      this.itemCountMin !== null && this.itemCountMax !== null
        ? this.randomInRange(this.itemCountMin, this.itemCountMax)
        : this.itemCount;

    return Array.from({ length: count }, (_, i) => {
      const id =
        availableItemIds[Math.floor(Math.random() * availableItemIds.length)];
      return {
        id,
        instanceId: `${this.id}-item-${i}`,
        genre: getItemGenre(id),
        remainingUsages: getItemBehavior(id).usages ?? 1,
      };
    });
  }

  private filterValidItemIds(itemIds: ItemId[]): ItemId[] {
    const validIds = AVAILABLE_ITEM_IDS;
    return itemIds.filter((id) => validIds.includes(id));
  }

  private resolveHealth(): number {
    if (this.healthMean !== null && this.healthStdDev !== null) {
      return this.generateNormalValue(
        this.healthMean,
        this.healthStdDev,
        this.healthLimitMin,
      );
    }
    return this.randomInRange(this.healthMin, this.healthMax);
  }

  private resolveBiasedSpeed(itemCount: number): number {
    let speed = 0;
    for (let i = 0; i < itemCount; i++) {
      const roll = biasedRoll();
      speed += 5 - roll;
    }
    return Math.max(1, speed + 1);
  }

  private randomInRange(min: number, max: number): number {
    const range = max - min + 1;
    return Math.floor(Math.random() * range) + min;
  }

  private resolveSpeed(biased: number): number {
    if (this.speedMean !== null && this.speedStdDev !== null) {
      return this.generateNormalValue(
        this.speedMean,
        this.speedStdDev,
        this.speedLimitMin,
      );
    }
    return this.randomInRange(this.speedMin, this.speedMax);
  }

  private generateNormalValue(
    mean: number,
    stdDev: number,
    min: number,
  ): number {
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    const val = Math.round(z * stdDev + mean);
    return Math.max(min, val);
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
