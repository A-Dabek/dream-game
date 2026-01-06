import {Duration} from '../../item';
import {GameEvent} from '../engine.model';

export interface PassiveDuration {
  update(event: GameEvent, playerId: string): PassiveDuration | null;
  onHandle(): PassiveDuration | null;
}

class PermanentDuration implements PassiveDuration {
  update(): PassiveDuration | null {
    return this;
  }
  onHandle(): PassiveDuration | null {
    return this;
  }
}

class ChargesDuration implements PassiveDuration {
  constructor(private readonly remainingCharges: number) {}
  update(): PassiveDuration | null {
    return this;
  }
  onHandle(): PassiveDuration | null {
    const next = this.remainingCharges - 1;
    return next > 0 ? new ChargesDuration(next) : null;
  }
}

class TurnsDuration implements PassiveDuration {
  constructor(private readonly remainingTurns: number) {}
  update(event: GameEvent, playerId: string): PassiveDuration | null {
    if (event.type === 'on_turn_end' && (event as any).playerId === playerId) {
      const next = this.remainingTurns - 1;
      return next > 0 ? new TurnsDuration(next) : null;
    }
    return this;
  }
  onHandle(): PassiveDuration | null {
    return this;
  }
}

export function createDuration(duration?: Duration): PassiveDuration {
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
