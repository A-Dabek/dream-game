import { GameEvent } from '../../engine.types';
import { DurationState } from '../listener-factory';

export interface ReactiveDuration {
  readonly isExpired: boolean;
  readonly type: 'permanent' | 'charges' | 'turns' | 'until_item_removed';
  readonly remaining: number;
  readonly itemInstanceId?: string;
  update(event: GameEvent, playerId: string): void;
  onHandle(): void;
  serialize(): DurationState;
  sync(state: DurationState): void;
}

export type DurationType = 'permanent' | 'charges' | 'turns';
