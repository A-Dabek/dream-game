import { GameEvent, GameEventStatus } from '../../engine.types';
import { isLifecycleGameEvent } from '../../type-guards';
import { DurationState } from '../listener-factory';
import { ReactiveDuration } from './reactive-duration';

export class TurnsDuration implements ReactiveDuration {
  constructor(public remainingTurns: number) {}

  get isExpired(): boolean {
    return this.remainingTurns <= 0;
  }

  get type(): 'turns' {
    return 'turns';
  }

  get remaining(): number {
    return this.remainingTurns;
  }

  update(event: GameEvent, playerId: string): void {
    if (
      isLifecycleGameEvent(event) &&
      event.phase === 'on_turn_end' &&
      event.playerId === playerId &&
      event.status === GameEventStatus.PROGRESS
    ) {
      this.remainingTurns--;
    }
  }

  onHandle(): void {}

  serialize(): DurationState {
    return { type: 'turns', remaining: this.remainingTurns };
  }

  sync(state: DurationState): void {
    if (state.type === 'turns') {
      this.remainingTurns = state.remaining;
    }
  }
}
