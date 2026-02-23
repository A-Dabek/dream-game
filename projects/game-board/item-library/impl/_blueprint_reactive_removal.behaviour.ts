import { Effect, ItemBehavior, afterEffect, PassiveEffect } from '../../item';
import { StatusEffectLibrary } from '../../effect-library';

export class BlueprintReactiveRemovalBehaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [];
  }

  passiveEffects(): PassiveEffect[] {
    return [
      StatusEffectLibrary.status_effect({
        type: 'reactive_removal',
        condition: afterEffect('damage'),
        action: [],
      }),
    ];
  }
}
