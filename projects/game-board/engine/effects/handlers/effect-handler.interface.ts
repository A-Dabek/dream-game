import { Effect } from '../../../item';
import { EngineState, GameEvent } from '../../engine.types';

export interface EffectHandler {
  readonly effectType: string;

  handle(
    state: EngineState,
    playerId: string,
    originalEffect: Effect,
  ): GameEvent[];
}
