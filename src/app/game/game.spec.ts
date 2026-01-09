import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { createCpuPlayer } from '../player';
import { Board, GameActionType } from '../board';
import { Strategy } from '../ai';

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should run a game until completion and update ratings', () => {
    const p1 = createCpuPlayer('p1', 'Player 1');
    const p2 = createCpuPlayer('p2', 'Player 2');

    const initialRating1 = p1.rating.value;
    const initialRating2 = p2.rating.value;

    const board = service.startGame(p1, p2);

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

  it('should handle a player surrendering immediately', () => {
    const p1 = createCpuPlayer('p1', 'Player 1');
    const p2 = createCpuPlayer('p2', 'Player 2');

    // Force p1 to surrender
    const surrenderStrategy: Strategy = {
      decide: (board: Board) => ({
        type: GameActionType.SURRENDER,
        playerId: board.currentPlayerId,
      }),
    };

    // Replace strategies for both to ensure whoever goes first surrenders
    (p1 as any).strategy = surrenderStrategy;
    (p2 as any).strategy = surrenderStrategy;

    const board = service.startGame(p1, p2);

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
