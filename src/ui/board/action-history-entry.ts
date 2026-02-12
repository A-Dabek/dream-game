import { GameActionType } from '@dream/board';

/** Presentation-friendly representation of a historical action for animation/display. */
export interface ActionHistoryEntry {
  readonly id: string;
  readonly actionType: GameActionType;
  readonly playerId: string;
  readonly iconName: string;
  readonly itemId?: string;
}
