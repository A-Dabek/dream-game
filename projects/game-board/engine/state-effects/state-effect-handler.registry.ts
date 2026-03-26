import { Effect } from '../../item';
import { EngineState, GameEvent } from '../engine.types';
import { StateEffectHandler } from './state-effect-handler.interface';

export class StateEffectHandlerRegistry {
  private handlers = new Map<string, StateEffectHandler>();

  register(handler: StateEffectHandler): void {
    this.handlers.set(handler.effectType, handler);
  }

  handle(
    state: EngineState,
    playerKey: 'playerOne' | 'playerTwo',
    effect: Effect,
  ): GameEvent | GameEvent[] {
    const handler = this.handlers.get(effect.type);
    if (!handler) {
      throw new Error(`No handler registered for effect type: ${effect.type}`);
    }
    return handler.handle(state, playerKey, effect);
  }
}
