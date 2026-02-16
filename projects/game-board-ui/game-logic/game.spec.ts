import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Strategy } from '@dream/ai';
import { Board, GameActionType } from '@dream/board';
import { createCpuPlayer } from '@dream/player';
import { HumanInputService, HumanStrategy } from '@dream/ui';
import { GameService } from './game.service';

describe('GameService', () => {
  let service: GameService;
  let humanInputService: HumanInputService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
    humanInputService = TestBed.inject(HumanInputService);
  });

  it('should allow human players to make decisions via HumanInputService', async () => {
    const p1 = createCpuPlayer('p1', 'Human');
    // Ensure p1 is very fast so it goes first
    (p1.loadout as any).speed = 1000;
    (p1 as any).strategy = TestBed.runInInjectionContext(
      () => new HumanStrategy(),
    );
    const p2 = createCpuPlayer('p2', 'CPU');
    (p2.loadout as any).speed = 1;

    const promise = service.startGame(p1, p2);

    humanInputService.submitAction({
      type: GameActionType.SURRENDER,
      playerId: 'p1',
    });

    const board = await promise;
    expect(board.isGameOver).toBe(true);
    expect(board.gameState.winnerId).toBe('p2');
  });

  it('should run a game until completion and update ratings', async () => {
    const p1 = createCpuPlayer('p1', 'Player 1');
    const p2 = createCpuPlayer('p2', 'Player 2');

    const initialRating1 = p1.rating.value;
    const initialRating2 = p2.rating.value;

    const board = await service.startGame(p1, p2);

    expect(board.isGameOver).toBe(true);
    expect(board.gameState.winnerId).toBeDefined();

    // One rating should increase, another should decrease
    const ratingChanged =
      p1.rating.value !== initialRating1 || p2.rating.value !== initialRating2;
    expect(ratingChanged).toBe(true);

    if (board.gameState.winnerId === p1.id) {
      expect(p1.rating.value).toBeGreaterThan(initialRating1);
      expect(p2.rating.value).toBeLessThan(initialRating2);
    } else {
      expect(p2.rating.value).toBeGreaterThan(initialRating2);
      expect(p1.rating.value).toBeLessThan(initialRating1);
    }
  });

  it('should handle a player surrendering immediately', async () => {
    const p1 = createCpuPlayer('p1', 'Player 1');
    const p2 = createCpuPlayer('p2', 'Player 2');

    // Force p1 to surrender
    const surrenderStrategy: Strategy = {
      decide: async (board: Board) => ({
        type: GameActionType.SURRENDER,
        playerId: board.currentPlayerId,
      }),
    };

    // Replace strategies for both to ensure whoever goes first surrenders
    (p1 as any).strategy = surrenderStrategy;
    (p2 as any).strategy = surrenderStrategy;

    const board = await service.startGame(p1, p2);

    expect(board.isGameOver).toBe(true);
    expect(board.gameState.actionHistory[0].type).toBe(
      GameActionType.SURRENDER,
    );
    expect(board.gameState.winnerId).toBeDefined();
  });

  it('should not update ratings if there is no winner (though unlikely with current loop)', () => {
    const p1 = createCpuPlayer('p1', 'Player 1');
    const p2 = createCpuPlayer('p2', 'Player 2');

    const initialRating1 = p1.rating.value;
    const initialRating2 = p2.rating.value;

    // Manually call updateRatings with a board that has no winner
    const board = new Board(
      { ...p1.loadout, id: p1.id },
      { ...p2.loadout, id: p2.id },
    );

    // Accessing private method for testing purposes
    (service as any).updateRatings(board, p1, p2);

    expect(p1.rating.value).toBe(initialRating1);
    expect(p2.rating.value).toBe(initialRating2);
  });
});
