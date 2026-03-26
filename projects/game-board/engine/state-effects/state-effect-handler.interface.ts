import { Effect } from '../../item';
import { EngineState, GameEvent } from '../engine.types';

export interface StateEffectHandler {
  readonly effectType: string;

  handle(
    state: EngineState,
    playerKey: 'playerOne' | 'playerTwo',
    effect: Effect,
  ): GameEvent | GameEvent[];
}
