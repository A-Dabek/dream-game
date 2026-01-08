import {afterEffect, statusEffect} from '..';
import {Effect, ItemBehavior, PassiveEffect} from '../item.model';

/**
 * Behavior for the _blueprint_reactive_removal item.
 * This item does nothing when played, but it reacts to its owner being damaged while in the loadout.
 */
export class BlueprintReactiveRemovalBehaviour implements ItemBehavior {
  /**
   * Returns no effects when played.
   */
  whenPlayed(): Effect[] {
    return [];
  }

  /**
   * Returns passive effects that are active while the item is in the loadout.
   */
  passiveEffects(): PassiveEffect[] {
    return [
      statusEffect({
        type: 'reactive_removal',
        condition: afterEffect('damage'),
        action: [],
      }),
    ];
  }
}
