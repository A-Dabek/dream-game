import { onTurnEnd, StatusEffect } from '../../../../item';
import { EngineState, GameEvent } from '../../../engine.types';
import { BaseEffectInstance } from '../base-effect-instance';

export class AdvanceTurnListener extends BaseEffectInstance {
  constructor(instanceId: string, playerId: string) {
    const effect: StatusEffect = {
      condition: onTurnEnd(),
      action: [{ type: 'advance_turn', value: 0, target: 'self' }],
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
