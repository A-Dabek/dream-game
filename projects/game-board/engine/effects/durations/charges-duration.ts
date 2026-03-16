import { DurationState } from '../listener-factory';
import { ReactiveDuration } from './reactive-duration';

export class ChargesDuration implements ReactiveDuration {
  constructor(public remainingCharges: number) {}

  get isExpired(): boolean {
    return this.remainingCharges <= 0;
  }

  get type(): 'charges' {
    return 'charges';
  }

  get remaining(): number {
    return this.remainingCharges;
  }

  update(): void {}

  onHandle(): void {
    this.remainingCharges--;
  }

  serialize(): DurationState {
    return { type: 'charges', remaining: this.remainingCharges };
  }

  sync(state: DurationState): void {
    if (state.type === 'charges') {
      this.remainingCharges = state.remaining;
    }
  }
}
