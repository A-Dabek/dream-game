import { Effect } from '../../../item';
import { EngineState, GameEvent, GameEventStatus } from '../../engine.types';
import { StateEffectHandler } from '../state-effect-handler.interface';
import { getTargetKey, checkGameOver, getPlayer } from './utils';

export class DamageHandler implements StateEffectHandler {
  readonly effectType = 'damage';

  handle(
    state: EngineState,
    playerKey: 'playerOne' | 'playerTwo',
    effect: Effect,
  ): GameEvent | GameEvent[] {
    const targetKey = getTargetKey(playerKey, effect.target);
    const targetPlayer = getPlayer(state, targetKey);
    const sourcePlayer = getPlayer(state, playerKey);

    const actualDamage = Math.min(effect.value as number, targetPlayer.health);
    targetPlayer.health -= actualDamage;

    effect.value = actualDamage;

    const gameOverEvent = checkGameOver(state, targetKey);
    if (gameOverEvent) {
      return [this.createDoneEvent(sourcePlayer.id, effect), gameOverEvent];
    }

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
