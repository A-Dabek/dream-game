import { describe, expect, it } from 'vitest';
import { GameEvent, GameEventStatus } from '../../../engine.types';
import { AntiNullifyListener } from './anti-nullify-listener';
import { createInitialListenerData } from '../../listener-factory';
import { ConditionLibrary } from '../../../../item/conditions';
import { permanent } from '../../../../item/durations';

describe('AntiNullifyListener', () => {
  it('should react to NULLIFY status and change it back to PROGRESS', () => {
    const effect = {
      type: 'anti_nullify' as const,
      condition: ConditionLibrary.beforeNullify(),
      action: [],
      duration: permanent(),
      genre: 'basic' as const,
      mergeStrategy: 'new' as const,
    };
    const data = createInitialListenerData('anti-1', 'p1', effect);
    const listener = new AntiNullifyListener();

    const event: GameEvent = {
      type: 'effect',
      status: GameEventStatus.NULLIFY,
      playerId: 'p2',
      effect: { type: 'damage', value: 10, target: 'enemy' },
      processedBy: [],
    };

    const state: any = { playerOne: { id: 'p1' }, playerTwo: { id: 'p2' } };
    const { event: reactions } = listener.handle(event, state, data);

    expect(reactions.length).toBe(1);
    expect(reactions[0].status).toBe(GameEventStatus.PROGRESS);
  });
});
