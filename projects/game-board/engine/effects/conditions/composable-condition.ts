import { EngineState, GameEvent } from '../../engine.types';
import { ReactiveCondition } from './reactive-condition';

export class ComposableCondition implements ReactiveCondition {
  constructor(
    readonly type: string,
    private readonly predicate: (
      event: GameEvent,
      playerId: string,
      state: EngineState,
    ) => boolean,
  ) {}

  shouldReact(event: GameEvent, playerId: string, state: EngineState): boolean {
    return this.predicate(event, playerId, state);
  }
}
