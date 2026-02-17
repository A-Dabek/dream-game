import { Effect, ItemBehavior } from '../../item';

export class DummyBehavior implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [];
  }
}
