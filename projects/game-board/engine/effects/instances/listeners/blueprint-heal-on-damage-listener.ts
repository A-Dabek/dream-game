import {
  EngineState,
  GameEvent,
  GameEventFactory,
  ListenerData,
} from '../../../engine.model';
import { BaseEffectInstance } from '../base-effect-instance';
import { ActiveEffectLibrary } from '../../../../effect-library';
import { ReactiveCondition } from '../../conditions';

export class BlueprintHealOnDamageListener extends BaseEffectInstance {
  protected override handleReaction(
    event: GameEvent,
    state: EngineState,
    data: ListenerData,
    condition: ReactiveCondition,
  ): GameEvent[] | null {
    if (!this.shouldReact(event, state, data, condition)) {
      return null;
    }

    const healEvent = GameEventFactory.createEffect(
      data.playerId,
      ActiveEffectLibrary.heal(1, 'self'),
    );

    return [event, healEvent];
  }
}
