import {
  EngineState,
  GameEvent,
  GameEventFactory,
  ListenerData,
} from '../../../engine.model';
import { BaseEffectInstance } from '../base-effect-instance';
import { createCondition, ReactiveCondition } from '../../conditions';

export class ImpatienceListener extends BaseEffectInstance {
  protected handleReaction(
    event: GameEvent,
    state: EngineState,
    data: ListenerData,
    condition: ReactiveCondition,
  ): GameEvent[] | null {
    // This method is not used - we override handle instead
    return null;
  }

  override handle(
    event: GameEvent,
    state: EngineState,
    data: ListenerData,
  ): { event: GameEvent[]; data: ListenerData } {
    const condition = createCondition(data.effectState.effect.condition);

    if (!this.shouldReact(event, state, data, condition)) {
      return { event: [event], data };
    }

    // Get current damage value from remaining duration (starts at 1)
    const damageValue = data.effectState.currentDuration.remaining || 1;

    // Create damage effect
    const damageEvent = GameEventFactory.createEffect(data.playerId, {
      type: 'damage',
      value: damageValue,
      target: 'self',
    });

    // Increment the remaining count for next time
    const updatedData: ListenerData = {
      ...data,
      effectState: {
        ...data.effectState,
        currentDuration: {
          ...data.effectState.currentDuration,
          remaining: damageValue + 1,
        },
      },
    };

    return { event: [event, damageEvent], data: updatedData };
  }
}
