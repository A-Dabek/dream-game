import { Effect } from '../../../item';
import { EngineState, GameEvent, GameEventFactory } from '../../engine.model';
import { EffectHandler } from './effect-handler.interface';

export class AntidoteHandler implements EffectHandler {
  readonly effectType = 'antidote';

  handle(
    state: EngineState,
    playerId: string,
    _originalEffect: Effect,
  ): GameEvent[] {
    const poisonListeners = state.listeners.filter(
      (l) => l.playerId === playerId && l.effectState.effect.type === 'poison',
    );

    return poisonListeners.map((l) =>
      GameEventFactory.createEffect(playerId, {
        type: 'remove_listener',
        value: l.instanceId,
        target: 'self',
      }),
    );
  }
}
