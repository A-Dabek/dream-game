import { Effect } from '../../../item';
import { EngineState, GameEvent, GameEventStatus } from '../../engine.types';
import { StateEffectHandler } from '../state-effect-handler.interface';
import { getTargetKey, getPlayer } from './utils';

export class HealingHandler implements StateEffectHandler {
  readonly effectType = 'healing';

  handle(
    state: EngineState,
    playerKey: 'playerOne' | 'playerTwo',
    effect: Effect,
  ): GameEvent {
    const targetKey = getTargetKey(playerKey, effect.target);
    const targetPlayer = getPlayer(state, targetKey);
    const sourcePlayer = getPlayer(state, playerKey);

    const healthDeficit = targetPlayer.maxHealth - targetPlayer.health;
    const actualHealing = Math.min(effect.value as number, healthDeficit);
    targetPlayer.health += actualHealing;

    effect.value = actualHealing;

    return this.createDoneEvent(sourcePlayer.id, effect);
  }

  private createDoneEvent(playerId: string, effect: Effect): GameEvent {
    return {
      type: 'effect',
      playerId,
      effect,
      processedBy: [],
      status: GameEventStatus.DONE,
    };
  }
}
