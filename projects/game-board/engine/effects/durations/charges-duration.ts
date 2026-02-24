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
}
