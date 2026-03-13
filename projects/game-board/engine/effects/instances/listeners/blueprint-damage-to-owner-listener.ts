import {
  EngineState,
  GameEvent,
  GameEventFactory,
} from '../../../engine.model';
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

    const extraDamageEvent = GameEventFactory.createEffect(
      this.playerId,
      ActiveEffectLibrary.attack(1, 'self'),
    );

    return [event, extraDamageEvent];
  }
}
