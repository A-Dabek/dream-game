import { ReactiveDuration } from './reactive-duration';

export class ChargesDuration implements ReactiveDuration {
  constructor(public remainingCharges: number) {}

  get isExpired(): boolean {
    return this.remainingCharges <= 0;
  }

  update(): void {}

  onHandle(): void {
    this.remainingCharges--;
  }
}
