import {
  EngineState,
  GameEvent,
  GameEventFactory,
  ListenerData,
} from '../../../engine.model';
import { BaseEffectInstance } from '../base-effect-instance';
import { ActiveEffectLibrary } from '../../../../effect-library';
import { ReactiveCondition } from '../../conditions';

export class BlueprintDamageToOwnerListener extends BaseEffectInstance {
  protected override handleReaction(
    event: GameEvent,
    state: EngineState,
    data: ListenerData,
    condition: ReactiveCondition,
  ): GameEvent[] | null {
    if (!this.shouldReact(event, state, data, condition)) {
      return null;
    }

    const extraDamageEvent = GameEventFactory.createEffect(
      data.playerId,
      ActiveEffectLibrary.attack(1, 'self'),
    );

    return [event, extraDamageEvent];
  }
}
