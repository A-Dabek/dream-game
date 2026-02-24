import { ReactiveDuration } from './reactive-duration';

export class PermanentDuration implements ReactiveDuration {
  get isExpired(): boolean {
    return false;
  }

  get type(): 'permanent' {
    return 'permanent';
  }

  get remaining(): number {
    return 0;
  }

  update(): void {}

  onHandle(): void {}
}
