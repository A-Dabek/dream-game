import { DurationState } from '../listener-factory';
import { ReactiveDuration } from './reactive-duration';

export class PermanentDuration implements ReactiveDuration {
  private _remaining = 0;

  constructor(initialRemaining = 0) {
    this._remaining = initialRemaining;
  }

  get isExpired(): boolean {
    return false;
  }

  get type(): 'permanent' {
    return 'permanent';
  }

  get remaining(): number {
    return this._remaining;
  }

  set remaining(value: number) {
    this._remaining = value;
  }

  update(): void {}

  onHandle(): void {}

  serialize(): DurationState {
    return { type: 'permanent', remaining: this.remaining };
  }

  sync(state: DurationState): void {
    if (state.type === 'permanent') {
      this.remaining = state.remaining;
    }
  }
}
