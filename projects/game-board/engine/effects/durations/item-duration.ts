import { GameEvent } from '../../engine.types';
import { ReactiveDuration } from './reactive-duration';

export class ItemDuration implements ReactiveDuration {
  private _isExpired = false;

  constructor(private readonly itemInstanceId: string) {}

  get isExpired(): boolean {
    return this._isExpired;
  }

  update(event: GameEvent): void {
    if (
      event.type === 'effect' &&
      event.effect.type === 'remove_item' &&
      event.effect.value === this.itemInstanceId
    ) {
      this._isExpired = true;
    }
  }

  onHandle(): void {}
}
