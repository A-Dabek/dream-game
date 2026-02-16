import { TestBoardBuilder } from '@test';
import { beforeEach, describe, expect, it } from 'vitest';
import { FirstAvailableStrategy } from './first-available.strategy';

describe('FirstAvailableStrategy', () => {
  let strategy: FirstAvailableStrategy;

  beforeEach(() => {
    strategy = new FirstAvailableStrategy();
  });

  it('should choose the leftmost item for the current player', async () => {
    const board = new TestBoardBuilder()
      .withPlayer1(100, '_blueprint_attack', '_blueprint_reactive_removal')
      .withPlayer2(100, 1, '_blueprint_attack')
      .build();

    const action = await strategy.decide(board);

    expect(action).toMatchInlineSnapshot(`
      {
        "itemId": "_blueprint_attack",
        "playerId": "player1",
        "type": "PLAY_ITEM",
      }
    `);
  });

  it('should choose the leftmost item for player 2 when it is their turn', async () => {
    const board = new TestBoardBuilder()
      .withPlayer1(100, 1, '_blueprint_attack')
      .withPlayer2(100, 100, '_blueprint_reactive_removal', '_blueprint_attack')
      .build();

    const action = await strategy.decide(board);

    expect(action).toMatchInlineSnapshot(`
      {
        "itemId": "_blueprint_reactive_removal",
        "playerId": "player2",
        "type": "PLAY_ITEM",
      }
    `);
  });

  it('should return a pass action if the player has no items', async () => {
    const board = new TestBoardBuilder()
      .withPlayer1(100)
      .withPlayer2(100, 1, '_blueprint_attack')
      .build();

    const action = await strategy.decide(board);

    expect(action).toMatchInlineSnapshot(`
      {
        "playerId": "player1",
        "type": "PLAY_ITEM",
      }
    `);
  });
});
