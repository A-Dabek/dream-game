import { Genre, GameActionType, ItemId } from '@dream/game-board';

/** Presentation-friendly representation of a historical action for animation/display. */
export interface ActionHistoryEntry {
  readonly id: string;
  readonly actionType: GameActionType;
  readonly playerId: string;
  readonly pathD: string;
  readonly itemId?: ItemId;
  readonly genre?: Genre;
}
