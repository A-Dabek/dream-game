import { Duration } from '../../../item';
import { PermanentDuration } from './permanent-duration';
import { ChargesDuration } from './charges-duration';
import { TurnsDuration } from './turns-duration';
import { ItemDuration } from './item-duration';
import { ReactiveDuration } from './reactive-duration';

export function createDuration(duration?: Duration): ReactiveDuration {
  if (!duration) return new PermanentDuration();
  switch (duration.type) {
    case 'charges':
      return new ChargesDuration((duration.value as number) ?? 0);
    case 'turns':
      return new TurnsDuration((duration.value as number) ?? 0);
    case 'until_item_removed':
      return new ItemDuration((duration.value as string) ?? '');
    case 'permanent':
    default:
      return new PermanentDuration();
  }
}
