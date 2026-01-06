import {computed, signal} from '@angular/core';
import {Effect, getItemBehavior, ItemId, Loadout, removeItem,} from '../item';
import {ListenerFactory} from './effects';
import {EngineLoadout, EngineState, GameEvent, Listener} from './engine.model';
import {PROCESSORS} from './processors';

export class Engine {
  private readonly engineStateSignal = signal<EngineState>(null!);

  readonly state = computed(() => this.engineStateSignal());

  constructor(
    playerOne: Loadout & {id: string},
    playerTwo: Loadout & {id: string}
  ) {
    const p1 = this.prepareLoadout(playerOne);
    const p2 = this.prepareLoadout(playerTwo);

    const listeners = [...this.scanForListeners(p1), ...this.scanForListeners(p2)];

    this.engineStateSignal.set({
      playerOne: p1,
      playerTwo: p2,
      listeners,
    });
  }

  play(playerId: string, itemId: ItemId): void {
    const behavior = getItemBehavior(itemId);

    this.engineStateSignal.update((state) => {
      // 1. Emit on_play event
      let currentState = this.processEvent(
        {type: 'on_play', playerId, itemId},
        state.listeners,
        state
      );

      // 2. Process item effects
      const effects: Effect[] = [
        removeItem(itemId),
        ...behavior.whenPlayed(),
      ];

      return effects.reduce((accState, effect) => {
        return this.processEvent(
          {...effect, actingPlayerId: playerId},
          accState.listeners,
          accState
        );
      }, currentState);
    });
  }

  processEndOfTurn(playerId: string): void {
    this.engineStateSignal.update((state) => {
      // Emit on_turn_end event. Turns decrement is handled by listeners reacting to this event.
      return this.processEvent({type: 'on_turn_end', playerId}, state.listeners, state);
    });
  }

  private prepareLoadout(loadout: Loadout & {id: string}): EngineLoadout {
    return {
      ...loadout,
      items: loadout.items.map((item, index) => ({
        ...item,
        instanceId: item.instanceId ?? `${loadout.id}-${item.id}-${index}`,
      })),
    };
  }

  private scanForListeners(player: EngineLoadout): Listener[] {
    return player.items.flatMap((item) => {
      const behavior = getItemBehavior(item.id);
      const effects = behavior.passiveEffects?.() ?? [];
      return effects.map((effect) =>
        ListenerFactory.createFromPassive(item.instanceId!, player.id, effect)
      );
    });
  }


  private processEvent(
    event: GameEvent,
    listenersToProcess: Listener[],
    state: EngineState,
    depth = 0
  ): EngineState {
    if (depth > 50) return state;

    if (listenersToProcess.length === 0) {
      // Basic effect processing via processors
      const processor = PROCESSORS[event.type];
      if (processor) {
        const actingPlayerId = 'actingPlayerId' in event ? event.actingPlayerId : (event as any).playerId;
        const playerKey = state.playerOne.id === actingPlayerId ? 'playerOne' : 'playerTwo';
        return processor(state, playerKey, event as Effect);
      }
      return state;
    }

    const [current, ...remaining] = listenersToProcess;
    const {event: resultEvent, nextListener} = current.handle(event, state);

    // Update state with next version of the listener
    let nextState = state;
    if (nextListener !== current) {
      const updatedListeners = state.listeners
        .map((l) => (l.instanceId === current.instanceId ? nextListener : l))
        .filter((l): l is Listener => l !== null);
      nextState = {...state, listeners: updatedListeners};
    }

    if (resultEvent === undefined) {
      return nextState;
    }

    if (Array.isArray(resultEvent)) {
      return resultEvent.reduce(
        (accState, e) => this.processEvent(e, remaining, accState, depth),
        nextState
      );
    }

    return this.processEvent(resultEvent, remaining, nextState, depth);
  }
}

