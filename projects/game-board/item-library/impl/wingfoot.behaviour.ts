import { Effect, ItemBehavior } from '../../item';
import { ActiveEffectLibrary } from '../../effect-library';
import { GAME_CONFIG } from '../../item';

export class WingfootBehaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [
      ActiveEffectLibrary.modify_speed(GAME_CONFIG.BASE_SPEED_MODIFIER, 'self'),
    ];
  }
}
