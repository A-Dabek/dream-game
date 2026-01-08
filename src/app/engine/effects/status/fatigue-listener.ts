import { ON_TURN_END, StatusEffect } from '../../../item';
import { EngineState, GameEvent } from '../../engine.model';
import { BaseStatusEffectInstance } from './base-status-effect-instance';

/**
 * Listener that applies damage to the player at the end of their turn if they have no items.
 */
export class FatigueListener extends BaseStatusEffectInstance {
  constructor(instanceId: string, playerId: string) {
    const effect: StatusEffect = {
      condition: { type: ON_TURN_END },
      action: [{ type: 'damage', value: 1, target: 'self' }],
      duration: { type: 'permanent' },
    };
    super(instanceId, playerId, effect);
  }

  protected override handleReaction(
    event: GameEvent,
    state: EngineState,
  ): GameEvent[] | null {
    if (this.shouldReact(event, state)) {
      const player =
        state.playerOne.id === this.playerId
          ? state.playerOne
          : state.playerTwo;
      if (player.items.length === 0) {
        return [
          event,
          {
            type: 'damage',
            value: 1,
            target: 'self',
            playerId: this.playerId,
          } as GameEvent,
        ];
      }
    }
    return null;
  }
}
