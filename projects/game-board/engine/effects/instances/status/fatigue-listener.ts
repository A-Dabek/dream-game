import { and, hasNoItems, onTurnEnd, StatusEffect } from '../../../../item';
import { EngineState, GameEvent } from '../../../engine.types';
import { BaseStatusEffectInstance } from './base-status-effect-instance';

export class FatigueListener extends BaseStatusEffectInstance {
  constructor(instanceId: string, playerId: string) {
    const effect: StatusEffect = {
      condition: and(onTurnEnd(), hasNoItems()),
      action: [{ type: 'damage', value: 1, target: 'self' }],
      duration: { type: 'permanent' },
    };
    super(instanceId, playerId, effect);
  }

  protected override handleReaction(
    event: GameEvent,
    state: EngineState,
  ): GameEvent[] | null {
    return this.defaultHandleReaction(event, state);
  }
}
