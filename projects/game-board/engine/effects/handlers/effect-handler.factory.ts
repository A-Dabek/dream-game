import { Effect } from '../../../item';
import { EngineState, GameEvent } from '../../engine.types';
import { EffectHandler } from './effect-handler.interface';
import { DefaultEffectHandler } from './default-effect.handler';
import { ItemCountDamageHandler } from './item-count-damage.handler';
import { AntidoteHandler } from './antidote.handler';

export const EffectHandlerFactory = {
  handlers: {
    item_count_damage: new ItemCountDamageHandler(),
    antidote: new AntidoteHandler(),
  } as Record<string, EffectHandler>,

  defaultHandler: new DefaultEffectHandler(),

  getHandler(effectType: string): EffectHandler {
    return this.handlers[effectType] ?? this.defaultHandler;
  },

  processEffect(
    effect: Effect,
    state: EngineState,
    playerId: string,
  ): GameEvent[] {
    const handler = this.getHandler(effect.type);
    return handler.handle(state, playerId, effect);
  },
};
