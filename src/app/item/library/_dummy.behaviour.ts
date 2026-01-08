import { Effect, ItemBehavior } from '../item.model';

export class DummyBehavior implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [];
  }
}
