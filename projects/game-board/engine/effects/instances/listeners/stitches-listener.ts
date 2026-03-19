import {
  EngineState,
  GameEvent,
  GameEventFactory,
  ListenerData,
} from '../../../engine.model';
import { BaseEffectInstance } from '../base-effect-instance';
import { createCondition, ReactiveCondition } from '../../conditions';

export class StitchesListener extends BaseEffectInstance {
  private initialHealAmount: number | null = null;

  protected handleReaction(
    event: GameEvent,
    state: EngineState,
    data: ListenerData,
    condition: ReactiveCondition,
  ): GameEvent[] | null {
    // This method is not used - we override handle instead for complex logic
    return null;
  }

  private isDamageTargetingPlayer(
    event: GameEvent,
    state: EngineState,
    playerId: string,
  ): boolean {
    if (event.type !== 'effect' || event.effect.type !== 'damage') {
      return false;
    }

    const target = event.effect.target ?? 'enemy';
    const eventPlayerId = event.playerId;

    // Determine who is being targeted by the damage
    if (target === 'self') {
      // Damage targets the player who created the event
      return eventPlayerId === playerId;
    } else {
      // Damage targets the enemy of the player who created the event
      const enemyId =
        state.playerOne.id === eventPlayerId
          ? state.playerTwo.id
          : state.playerOne.id;
      return enemyId === playerId;
    }
  }

  override handle(
    event: GameEvent,
    state: EngineState,
    data: ListenerData,
  ): { event: GameEvent[]; data: ListenerData } {
    const condition = createCondition(data.effectState.effect.condition);

    // Only react to damage events targeting the player with stitches
    if (
      !this.shouldReact(event, state, data, condition) ||
      !this.isDamageTargetingPlayer(event, state, data.playerId)
    ) {
      return { event: [event], data };
    }

    // Store initial heal amount on first activation (from duration remaining)
    if (this.initialHealAmount === null) {
      this.initialHealAmount = data.effectState.currentDuration.remaining;
    }

    const damageValue =
      event.type === 'effect' ? Number(event.effect.value) || 0 : 0;
    const currentCharges = data.effectState.currentDuration.remaining;

    // Reduce charges by the damage amount (don't absorb, just track)
    const newCharges = Math.max(0, currentCharges - damageValue);

    const events: GameEvent[] = [];

    // Damage passes through unchanged
    events.push(event);

    // If all charges are consumed, deal back the initial heal amount as damage
    if (newCharges <= 0 && currentCharges > 0) {
      const returnDamageEvent = GameEventFactory.createEffect(data.playerId, {
        type: 'damage',
        value: this.initialHealAmount,
        target: 'self',
      });
      events.push(returnDamageEvent);

      // Remove the stitches effect since charges reached 0
      const removeListenerEvent = GameEventFactory.createEffect(data.playerId, {
        type: 'remove_listener',
        value: data.instanceId,
      });
      events.push(removeListenerEvent);
    }

    // Update the charges in the listener data
    const updatedData: ListenerData = {
      ...data,
      effectState: {
        ...data.effectState,
        currentDuration: {
          ...data.effectState.currentDuration,
          remaining: newCharges,
        },
      },
    };

    return { event: events, data: updatedData };
  }
}
