import { describe, it, expect } from 'vitest';
import { GameState, ListenerData, StatusEffectData } from '@dream/game-board';
import {
  mapListenerToDisplayData,
  mapStatusEffectToDisplayData,
  mapToUiState,
} from './ui-state-mapper';
import { ItemConventionRegistry } from '../common';

describe('ui-state-mapper', () => {
  describe('mapStatusEffectToDisplayData', () => {
    it('should map poison correctly', () => {
      const effect: StatusEffectData = {
        instanceId: '1',
        type: 'poison',
        remainingCharges: 3,
        durationType: 'turns',
        genre: 'poison',
      };

      const result = mapStatusEffectToDisplayData(effect);

      expect(result.instanceId).toBe('1');
      expect(result.type).toBe('poison');
      expect(result.iconName).toBe(
        ItemConventionRegistry.getStatusEffectConvention('poison').icon,
      );
      expect(result.genre).toBe('poison');
    });

    it('should fallback for unknown effect type', () => {
      const effect: StatusEffectData = {
        instanceId: '1',
        type: 'unknown' as any,
        remainingCharges: 3,
        durationType: 'turns',
        genre: 'basic',
      };

      const result = mapStatusEffectToDisplayData(effect);
      expect(result.genre).toBe('basic');
      expect(result.iconName).toBe('uncertainty');
    });
  });

  describe('mapListenerToDisplayData', () => {
    it('should map listener correctly', () => {
      const listener: ListenerData = {
        instanceId: 'e1',
        playerId: 'p1',
        effectState: {
          effect: {
            type: 'poison' as any,
            condition: { type: 'on_turn_end' },
            action: [],
            genre: 'poison',
            mergeStrategy: 'new' as const,
          },
          currentDuration: { type: 'turns', remaining: 3 },
        },
      };

      const result = mapListenerToDisplayData(listener);

      expect(result.instanceId).toBe('e1');
      expect(result.type).toBe('poison');
      expect(result.iconName).toBe(
        ItemConventionRegistry.getStatusEffectConvention('poison').icon,
      );
      expect(result.genre).toBe('poison');
    });

    it('should fallback for unknown effect type in listener', () => {
      const listener: ListenerData = {
        instanceId: 'e1',
        playerId: 'p1',
        effectState: {
          effect: {
            type: 'unknown' as any,
            condition: { type: 'on_turn_end' },
            action: [],
            genre: 'basic',
            mergeStrategy: 'new' as const,
          },
          currentDuration: { type: 'turns', remaining: 3 },
        },
      };

      const result = mapListenerToDisplayData(listener);
      expect(result.iconName).toBe('uncertainty');
    });
  });

  describe('mapToUiState', () => {
    it('should map a whole GameState', () => {
      const state: GameState = {
        player: { id: 'p1', health: 100, maxHealth: 100, speed: 10, items: [] },
        opponent: {
          id: 'o1',
          health: 100,
          maxHealth: 100,
          speed: 10,
          items: [],
        },
        turnInfo: {
          currentPlayerId: 'p1',
          nextPlayerId: 'o1',
          turnQueue: [],
        },
        isGameOver: false,
        actionHistory: [],
        playerStatusEffects: [
          {
            instanceId: 'e1',
            type: 'poison',
            remainingCharges: 3,
            durationType: 'turns',
            genre: 'poison',
          },
        ],
        opponentStatusEffects: [],
      };

      const result = mapToUiState(state);

      expect(result.playerStatusEffects.length).toBe(1);
      expect(result.playerStatusEffects[0].iconName).toBeDefined();
      expect(result.playerStatusEffects[0].genre).toBe('poison');
    });
  });
});
