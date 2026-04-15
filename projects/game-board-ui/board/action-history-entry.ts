import { Genre, GameActionType, ItemId } from '@dream/game-board';
import { IconName } from '@shared-ui';

/** Presentation-friendly representation of a historical action for animation/display. */
export interface ActionHistoryEntry {
  readonly id: string;
  readonly name: string;
  readonly actionType: GameActionType;
  readonly playerId: string;
  readonly iconName: IconName;
  readonly itemId?: ItemId;
  readonly genre?: Genre;
}
