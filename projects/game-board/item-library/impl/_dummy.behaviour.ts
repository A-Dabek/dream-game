import { Effect, ItemBehavior } from '@dream/item';

export class DummyBehavior implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [];
  }
}
