import { Effect, ItemBehavior } from '../../item';
import { ActiveEffectLibrary } from '../../effect-library';
import { GAME_CONFIG } from '../../item';

export class PunchBehaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [ActiveEffectLibrary.attack(GAME_CONFIG.BASE_ATTACK)];
  }
}
