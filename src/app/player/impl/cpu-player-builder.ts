import { BEHAVIORS } from '../../item/item-registry';
import { Player } from '../player.model';
import { PlayerRating } from '@dream/rating';
import { FirstAvailableStrategy } from '@dream/ai';
import { ItemId, Item, Loadout } from '@dream/item';
import { Strategy } from '@dream/ai';

/**
 * Builder for creating CPU players with configurable properties.
 *
 * Provides a fluent interface to configure health, speed, items, and strategy
 * before building the final Player object.
 */
export class CpuPlayerBuilder {
  private healthMin = 10;
  private healthMax = 15;
  private speedMin = 5;
  private speedMax = 10;
  private itemCount = 5;
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

    const items = this.generateRandomItems();
    const health = this.generateRandomValue(this.healthMin, this.healthMax);
    const speed = this.generateRandomValue(this.speedMin, this.speedMax);

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

  private generateRandomItems(): Item[] {
    const availableItemIds: ItemId[] = Object.keys(BEHAVIORS) as ItemId[];
    return Array.from({ length: this.itemCount }, (_, i) => ({
      id: availableItemIds[Math.floor(Math.random() * availableItemIds.length)],
      instanceId: `${this.id}-item-${i}`,
      genre: 'basic',
    }));
  }

  private generateRandomValue(min: number, max: number): number {
    const range = max - min + 1;
    return Math.floor(Math.random() * range) + min;
  }
}
