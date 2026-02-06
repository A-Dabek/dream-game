import { Duration } from '../../item';
import { GameEvent, isLifecycleGameEvent } from '../engine.model';

export interface ReactiveDuration {
  readonly isExpired: boolean;

  update(event: GameEvent, playerId: string): void;

  onHandle(): void;
}

class PermanentDuration implements ReactiveDuration {
  get isExpired(): boolean {
    return false;
  }

  update(): void {}

  onHandle(): void {}
}

class ChargesDuration implements ReactiveDuration {
  constructor(public remainingCharges: number) {}

  get isExpired(): boolean {
    return this.remainingCharges <= 0;
  }

  update(): void {}

  onHandle(): void {
    this.remainingCharges--;
  }
}

class TurnsDuration implements ReactiveDuration {
  constructor(public remainingTurns: number) {}

  get isExpired(): boolean {
    return this.remainingTurns <= 0;
  }

  update(event: GameEvent, playerId: string): void {
    if (
      isLifecycleGameEvent(event) &&
      event.phase === 'on_turn_end' &&
      event.playerId === playerId
    ) {
      this.remainingTurns--;
    }
  }

  onHandle(): void {}
}

export function createDuration(duration?: Duration): ReactiveDuration {
  if (!duration) return new PermanentDuration();
  switch (duration.type) {
    case 'charges':
      return new ChargesDuration(duration.value ?? 0);
    case 'turns':
      return new TurnsDuration(duration.value ?? 0);
    case 'permanent':
    default:
      return new PermanentDuration();
  }
}
