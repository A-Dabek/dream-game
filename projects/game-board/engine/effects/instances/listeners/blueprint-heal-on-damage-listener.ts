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

    // No infinite loop expected here as healing != damage,
    // but good practice to keep it consistent with other blueprint items
    if (
      event.type === 'effect' &&
      event.playerId === this.playerId &&
      event.effect.type === 'healing'
    ) {
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
