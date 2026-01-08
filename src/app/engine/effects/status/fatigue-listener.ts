import { and, hasNoItems, onTurnEnd, StatusEffect } from '../../../item';
import { EngineState, GameEvent } from '../../engine.model';
import { BaseStatusEffectInstance } from './base-status-effect-instance';

/**
 * Listener that applies damage to the player at the end of their turn if they have no items.
 */
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
