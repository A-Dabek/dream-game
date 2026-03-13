import { EngineState, GameEvent } from '../../../engine.types';
import { BaseEffectInstance } from '../base-effect-instance';
import { ListenerData } from '../../types';
import { ActiveEffectLibrary } from '../../../../effect-library';

export class BlueprintHealOnDamageListener extends BaseEffectInstance {
  constructor(data: ListenerData) {
    super(data);
  }

  protected override handleReaction(
    event: GameEvent,
    state: EngineState,
  ): GameEvent[] | null {
    if (!this.shouldReact(event, state)) {
      return null;
    }

    const healEvent: GameEvent = {
      type: 'effect',
      effect: ActiveEffectLibrary.heal(1, 'self'),
      playerId: this.playerId,
    };

    return [event, healEvent];
  }
}
