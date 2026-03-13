import { Effect } from '../../../item';
import { EngineState, GameEvent } from '../../engine.types';
import { EffectHandler } from './effect-handler.interface';

export class DefaultEffectHandler implements EffectHandler {
  readonly effectType = 'default';

  handle(
    state: EngineState,
    playerId: string,
    originalEffect: Effect,
  ): GameEvent[] {
    return [
      {
        type: 'effect',
        effect: originalEffect,
        playerId,
        processedBy: [],
      },
    ];
  }
}
