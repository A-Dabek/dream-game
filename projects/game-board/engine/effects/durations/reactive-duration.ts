import { GameEvent } from '../../engine.types';

export interface ReactiveDuration {
  readonly isExpired: boolean;
  readonly type: 'permanent' | 'charges' | 'turns' | 'until_item_removed';
  readonly remaining: number;
  readonly itemInstanceId?: string;
  update(event: GameEvent, playerId: string): void;
  onHandle(): void;
}

export type DurationType = 'permanent' | 'charges' | 'turns';
