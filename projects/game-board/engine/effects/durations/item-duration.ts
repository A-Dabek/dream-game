import { GameEvent, GameEventStatus } from '../../engine.types';
import { ReactiveDuration } from './reactive-duration';

export class ItemDuration implements ReactiveDuration {
  private _isExpired = false;

  constructor(private readonly _itemInstanceId: string) {}

  get isExpired(): boolean {
    return this._isExpired;
  }

  get type(): 'until_item_removed' {
    return 'until_item_removed';
  }

  get remaining(): number {
    return 0;
  }

  get itemInstanceId(): string {
    return this._itemInstanceId;
  }

  update(event: GameEvent): void {
    if (
      event.type === 'effect' &&
      event.effect.type === 'remove_item' &&
      event.effect.value === this._itemInstanceId &&
      event.status === GameEventStatus.PROGRESS
    ) {
      this._isExpired = true;
    }
  }

  onHandle(): void {}
}
