import {
  EngineState,
  GameState,
  ListenerData,
  StatusEffectData,
  StatusEffectType,
} from '@dream/game-board';
import { ItemConventionRegistry } from '../common';
import { StatusEffectDisplayData } from './status-effects-display-data';
import { UiGameState } from './ui-game-state';

function resolveStatusEffectIcon(type: string): string {
  try {
    return ItemConventionRegistry.getStatusEffectDisplay(
      type as StatusEffectType,
    ).pathD;
  } catch {
    // Fallback icon for unknown status effects
    return ItemConventionRegistry.resolveIconPath('uncertainty');
  }
}

/**
 * Maps a core StatusEffectData to UI-specific StatusEffectDisplayData.
 */
export function mapStatusEffectToDisplayData(
  data: StatusEffectData,
): StatusEffectDisplayData {
  return {
    ...data,
    pathD: resolveStatusEffectIcon(data.type),
  };
}

/**
 * Maps a ListenerData from the engine to UI-specific StatusEffectDisplayData.
 */
export function mapListenerToDisplayData(
  listener: ListenerData,
): StatusEffectDisplayData {
  const effectType = listener.effectState.effect.type;
  const duration = listener.effectState.currentDuration;
  const hasCharges = duration.type === 'turns' || duration.type === 'charges';

  return {
    instanceId: listener.instanceId,
    type: effectType,
    remainingCharges: hasCharges ? duration.remaining : null,
    durationType: duration.type,
    pathD: resolveStatusEffectIcon(effectType),
    genre: listener.effectState.effect.genre,
  };
}

/**
 * Maps a core GameState to a UiGameState.
 */
export function mapToUiState(state: GameState): UiGameState {
  return {
    ...state,
    playerStatusEffects: state.playerStatusEffects.map(
      mapStatusEffectToDisplayData,
    ),
    opponentStatusEffects: state.opponentStatusEffects.map(
      mapStatusEffectToDisplayData,
    ),
  };
}

/**
 * Maps an EngineState snapshot to a UiGameState.
 */
export function mapEngineStateToUiState(
  engineState: EngineState,
  currentUiState: UiGameState,
): UiGameState {
  const { playerOne, playerTwo, listeners, turnQueue, gameOver, winnerId } =
    engineState;

  const { playerStatusEffects, opponentStatusEffects } = listeners.reduce(
    (acc, listener) => {
      const displayData = mapListenerToDisplayData(listener);
      if (listener.playerId === playerOne.id) {
        acc.playerStatusEffects.push(displayData);
      } else if (listener.playerId === playerTwo.id) {
        acc.opponentStatusEffects.push(displayData);
      }
      return acc;
    },
    {
      playerStatusEffects: [] as StatusEffectDisplayData[],
      opponentStatusEffects: [] as StatusEffectDisplayData[],
    },
  );

  return {
    ...currentUiState,
    turnInfo: {
      turnQueue,
      currentPlayerId: turnQueue[0]?.playerId,
      nextPlayerId: turnQueue[1]?.playerId,
    },
    player: {
      ...currentUiState.player,
      health: playerOne.health,
      items: playerOne.items,
    },
    opponent: {
      ...currentUiState.opponent,
      health: playerTwo.health,
      items: playerTwo.items,
    },
    isGameOver: gameOver ?? currentUiState.isGameOver,
    winnerId: winnerId ?? currentUiState.winnerId,
    playerStatusEffects,
    opponentStatusEffects,
  };
}
