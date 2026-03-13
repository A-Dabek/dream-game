import { EngineState, GameEvent } from '../../../engine.types';
import { BaseEffectInstance } from '../base-effect-instance';
import { ListenerData } from '../../types';
import { ActiveEffectLibrary } from '../../../../effect-library';

export class BlueprintDamageToOwnerListener extends BaseEffectInstance {
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

    const extraDamageEvent: GameEvent = {
      type: 'effect',
      effect: ActiveEffectLibrary.attack(1, 'self'),
      playerId: this.playerId,
    };

    return [event, extraDamageEvent];
  }
}
