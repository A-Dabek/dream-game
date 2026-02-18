import { GameEvent } from '../../engine.types';
import { isLifecycleGameEvent } from '../../type-guards';
import { ReactiveDuration } from './reactive-duration';

export class TurnsDuration implements ReactiveDuration {
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
