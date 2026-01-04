import {ItemBehavior, ItemEffect} from './item.model';

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
}
