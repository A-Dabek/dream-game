import { ReactiveDuration } from './reactive-duration';

export class PermanentDuration implements ReactiveDuration {
  get isExpired(): boolean {
    return false;
  }

  update(): void {}

  onHandle(): void {}
}
