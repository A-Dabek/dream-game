import { Effect } from '../../../item';
import { EngineState, GameEvent, GameEventFactory } from '../../engine.model';
import { EffectHandler } from './effect-handler.interface';
import { StatusEffectLibrary } from '../../../effect-library/status-effects';

export class StitchesHandler implements EffectHandler {
  readonly effectType = 'stitches_heal';

  handle(
    state: EngineState,
    playerId: string,
    originalEffect: Effect,
  ): GameEvent[] {
    const player =
      state.playerOne.id === playerId ? state.playerOne : state.playerTwo;

    // Get heal amount from effect value (default 10)
    const requestedHeal = Number(originalEffect.value) || 10;

    // Calculate actual heal based on maxHealth cap
    const actualHeal = Math.min(
      requestedHeal,
      player.maxHealth - player.health,
    );

    const events: GameEvent[] = [];

    // Apply healing event if there's any healing to do
    if (actualHeal > 0) {
      events.push(
        GameEventFactory.createEffect(playerId, {
          type: 'healing',
          value: actualHeal,
          target: 'self',
        }),
      );
    }

    // Apply stitches status effect with charges equal to actual heal
    if (actualHeal > 0) {
      events.push(
        GameEventFactory.createEffect(playerId, {
          type: 'add_status_effect',
          value: StatusEffectLibrary.stitches(actualHeal),
          target: 'self',
        }),
      );
    }

    return events;
  }
}
