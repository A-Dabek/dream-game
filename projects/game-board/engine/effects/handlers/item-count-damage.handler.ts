import { Effect } from '../../../item';
import { EngineState, GameEvent, GameEventFactory } from '../../engine.model';
import { EffectHandler } from './effect-handler.interface';

export class ItemCountDamageHandler implements EffectHandler {
  readonly effectType = 'item_count_damage';

  handle(
    state: EngineState,
    playerId: string,
    originalEffect: Effect,
  ): GameEvent[] {
    const isPlayerOne = state.playerOne.id === playerId;
    const player = isPlayerOne ? state.playerOne : state.playerTwo;
    const enemy = isPlayerOne ? state.playerTwo : state.playerOne;

    const totalItems = player.items.length + enemy.items.length;

    const computedEffect: Effect = {
      type: 'damage',
      value: totalItems,
      target: originalEffect.target ?? 'enemy',
    };

    return [GameEventFactory.createEffect(playerId, computedEffect)];
  }
}
