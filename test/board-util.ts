import { Board, ItemId, getItemGenre } from '@dream/game-board';
import { BoardLoadout } from '../projects/game-board/board';

/**
 * Builder for creating test game boards with sensible defaults.
 * Assumes conventional player names and stats to reduce boilerplate.
 */
export class TestBoardBuilder {
  private player1Config: BoardLoadout = {
    id: 'player1',
    health: 100,
    speed: 100,
    items: [],
  };

  private player2Config: BoardLoadout = {
    id: 'player2',
    health: 100,
    speed: 1,
    items: [],
  };

  withPlayer1(health: number, ...itemIds: ItemId[]): this;
  withPlayer1(health: number, speed: number, ...itemIds: ItemId[]): this;
  withPlayer1(
    health: number,
    speedOrItem?: number | ItemId,
    ...rest: ItemId[]
  ): this {
    const isSpeed = typeof speedOrItem === 'number';
    const speed = isSpeed ? speedOrItem : 100;
    const items = isSpeed ? rest : speedOrItem ? [speedOrItem, ...rest] : rest;

    this.player1Config = {
      ...this.player1Config,
      health,
      speed,
      items: items.map((id) => ({ id, genre: getItemGenre(id) })),
    };
    return this;
  }

  withPlayer2(health: number, ...itemIds: ItemId[]): this;
  withPlayer2(health: number, speed: number, ...itemIds: ItemId[]): this;
  withPlayer2(
    health: number,
    speedOrItem?: number | ItemId,
    ...rest: ItemId[]
  ): this {
    const isSpeed = typeof speedOrItem === 'number';
    const speed = isSpeed ? speedOrItem : 1;
    const items = isSpeed ? rest : speedOrItem ? [speedOrItem, ...rest] : rest;

    this.player2Config = {
      ...this.player2Config,
      health,
      speed,
      items: items.map((id) => ({ id, genre: getItemGenre(id) })),
    };
    return this;
  }

  build(): Board {
    return new Board(this.player1Config, this.player2Config);
  }
}
