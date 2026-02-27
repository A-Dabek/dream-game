import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameState, ListenerData } from '@dream/game-board';
import { UiStateService } from './ui-state.service';
import { GameService } from '../../game-logic';
import { SoundService } from './sound.service';
import { Subject } from 'rxjs';

describe('UiStateService - Status Effects', () => {
  let service: UiStateService;
  let logsSubject: Subject<any[]>;

  const mockGameState = (): GameState => ({
    player: { id: 'player-1', health: 100, speed: 10, items: [] },
    opponent: { id: 'opponent-1', health: 100, speed: 10, items: [] },
    turnInfo: {
      currentPlayerId: 'player-1',
      nextPlayerId: 'opponent-1',
      turnQueue: [
        { playerId: 'player-1', turnId: '1', accumulatedError: 0 },
        { playerId: 'opponent-1', turnId: '2', accumulatedError: 0 },
      ],
    },
    isGameOver: false,
    actionHistory: [],
    playerStatusEffects: [],
    opponentStatusEffects: [],
  });

  const mockListener = (
    instanceId: string,
    playerId: string,
    effectType: string,
    durationType: 'turns' | 'charges' | 'permanent' | 'until_item_removed',
    remaining: number,
  ): ListenerData => ({
    instanceId,
    playerId,
    effectState: {
      effect: {
        type: effectType as never,
        condition: { type: 'on_turn_end' },
        action: [],
      },
      currentDuration: { type: durationType, remaining },
    },
  });

  const stateChangeLog = (
    listeners: ListenerData[],
    state = mockGameState(),
  ) => ({
    type: 'state-change',
    snapshot: {
      playerOne: state.player,
      playerTwo: state.opponent,
      turnQueue: state.turnInfo.turnQueue,
      listeners,
    },
  });

  beforeEach(() => {
    logsSubject = new Subject<any[]>();

    TestBed.configureTestingModule({
      providers: [
        UiStateService,
        {
          provide: GameService,
          useValue: {
            logs$: logsSubject.asObservable(),
            gameState: vi.fn().mockReturnValue(null),
          },
        },
        { provide: SoundService, useValue: { playItemSound: vi.fn() } },
      ],
    });

    service = TestBed.inject(UiStateService);
  });

  describe('initialization', () => {
    it('should start with empty status effects', () => {
      service.initialize(mockGameState());

      expect(service.uiState()?.playerStatusEffects).toEqual([]);
      expect(service.uiState()?.opponentStatusEffects).toEqual([]);
    });
  });

  describe('player mapping', () => {
    it('should map player listeners to playerStatusEffects', async () => {
      service.initialize(mockGameState());

      logsSubject.next([
        stateChangeLog([mockListener('e1', 'player-1', 'poison', 'turns', 3)]),
      ]);
      await new Promise((r) => setTimeout(r, 50));

      expect(service.uiState()?.playerStatusEffects.length).toBe(1);
      expect(service.uiState()?.opponentStatusEffects.length).toBe(0);
    });

    it('should map opponent listeners to opponentStatusEffects', async () => {
      service.initialize(mockGameState());

      logsSubject.next([
        stateChangeLog([
          mockListener('e1', 'opponent-1', 'negate', 'permanent', 0),
        ]),
      ]);
      await new Promise((r) => setTimeout(r, 50));

      expect(service.uiState()?.playerStatusEffects.length).toBe(0);
      expect(service.uiState()?.opponentStatusEffects.length).toBe(1);
    });

    it('should map both players correctly', async () => {
      service.initialize(mockGameState());

      logsSubject.next([
        stateChangeLog([
          mockListener('e1', 'player-1', 'poison', 'turns', 3),
          mockListener('e2', 'opponent-1', 'invert', 'charges', 2),
        ]),
      ]);
      await new Promise((r) => setTimeout(r, 50));

      expect(service.uiState()?.playerStatusEffects.length).toBe(1);
      expect(service.uiState()?.opponentStatusEffects.length).toBe(1);
    });
  });

  describe('data extraction', () => {
    it('should extract display data from listener', async () => {
      service.initialize(mockGameState());

      logsSubject.next([
        stateChangeLog([
          mockListener('e-123', 'player-1', 'poison', 'turns', 3),
        ]),
      ]);
      await new Promise((r) => setTimeout(r, 50));

      const data = service.uiState()?.playerStatusEffects[0];
      expect(data).toEqual({
        instanceId: 'e-123',
        type: 'poison',
        remainingCharges: 3,
        durationType: 'turns',
      });
    });

    it('should set remainingCharges to null for permanent duration', async () => {
      service.initialize(mockGameState());

      logsSubject.next([
        stateChangeLog([
          mockListener('e1', 'player-1', 'negate', 'permanent', 0),
        ]),
      ]);
      await new Promise((r) => setTimeout(r, 50));

      expect(
        service.uiState()?.playerStatusEffects[0].remainingCharges,
      ).toBeNull();
    });

    it('should set remainingCharges to null for until_item_removed duration', async () => {
      service.initialize(mockGameState());

      logsSubject.next([
        stateChangeLog([
          mockListener(
            'e1',
            'player-1',
            'reactive_removal',
            'until_item_removed',
            0,
          ),
        ]),
      ]);
      await new Promise((r) => setTimeout(r, 50));

      expect(
        service.uiState()?.playerStatusEffects[0].remainingCharges,
      ).toBeNull();
    });
  });

  describe('updates', () => {
    it('should add new effects', async () => {
      service.initialize(mockGameState());

      logsSubject.next([
        stateChangeLog([mockListener('e1', 'player-1', 'poison', 'turns', 3)]),
        stateChangeLog([
          mockListener('e1', 'player-1', 'poison', 'turns', 3),
          mockListener('e2', 'player-1', 'invert', 'charges', 2),
        ]),
      ]);
      await new Promise((r) => setTimeout(r, 300));

      expect(service.uiState()?.playerStatusEffects.length).toBe(2);
    });

    it('should clear effects when listeners are empty', async () => {
      service.initialize(mockGameState());

      logsSubject.next([
        stateChangeLog([mockListener('e1', 'player-1', 'poison', 'turns', 3)]),
        stateChangeLog([]),
      ]);
      await new Promise((r) => setTimeout(r, 300));

      expect(service.uiState()?.playerStatusEffects.length).toBe(0);
    });
  });
});
