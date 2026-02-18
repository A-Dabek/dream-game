import { GameEvent } from '../../engine.types';

export interface ReactiveDuration {
  readonly isExpired: boolean;
  update(event: GameEvent, playerId: string): void;
  onHandle(): void;
}

export type DurationType = 'permanent' | 'charges' | 'turns';
