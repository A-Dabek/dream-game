import { Duration } from '../../../item';
import { DurationState } from '../listener-factory';
import { PermanentDuration } from './permanent-duration';
import { ChargesDuration } from './charges-duration';
import { TurnsDuration } from './turns-duration';
import { ItemDuration } from './item-duration';
import { ReactiveDuration } from './reactive-duration';

export function deriveInitialDurationState(duration?: Duration): DurationState {
  const type = duration?.type ?? 'permanent';
  const hasRemaining =
    type === 'charges' || type === 'turns' || type === 'permanent';

  return {
    type,
    remaining: hasRemaining ? ((duration?.value as number) ?? 0) : 0,
  };
}

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
      return new PermanentDuration((duration.value as number) ?? 0);
    default:
      return new PermanentDuration();
  }
}
