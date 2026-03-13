import { Effect } from '../../../item';
import { EngineState, GameEvent, GameEventFactory } from '../../engine.model';
import { EffectHandler } from './effect-handler.interface';

export class DefaultEffectHandler implements EffectHandler {
  readonly effectType = 'default';

  handle(
    state: EngineState,
    playerId: string,
    originalEffect: Effect,
  ): GameEvent[] {
    return [GameEventFactory.createEffect(playerId, originalEffect)];
  }
}
