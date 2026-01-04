import {afterEffect, passive, removeItemFromOpponent} from '../item.effects';
import {ItemBehavior, ItemEffect, PassiveEffect} from '../item.model';

/**
 * Behavior for the _blueprint_reactive_removal item.
 * This item does nothing when played, but it reacts to being attacked while in the loadout.
 */
export class BlueprintReactiveRemovalBehaviour implements ItemBehavior {
  /**
   * Returns no effects when played.
   */
  whenPlayed(): ItemEffect[] {
    return [];
  }

  /**
   * Returns passive effects that are active while the item is in the loadout.
   */
  passiveEffects(): PassiveEffect[] {
    return [
      passive({
        condition: afterEffect('damage'),
        action: removeItemFromOpponent('_blueprint_reactive_removal'),
      }),
    ];
  }
}
