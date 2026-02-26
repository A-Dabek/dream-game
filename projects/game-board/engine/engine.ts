import { Effect, ItemId, Loadout } from '../item';
import { ActiveEffectLibrary } from '../effect-library';
import { getItemBehavior } from '../item-library';
import { TurnManager } from '../turn-manager';
import { ListenerFactory, ListenerData, EffectHandlerFactory } from './effects';
import {
  EngineLoadout,
  EngineState,
  GameEvent,
  LogEntry,
} from './engine.model';
import { PROCESSORS } from './processors';

export class Engine {
  private _state: EngineState = null!;
  get state(): EngineState {
    return this._state;
  }
  private readonly logBuffer: LogEntry[] = [];
  constructor(
    playerOne: Loadout & { id: string },
    playerTwo: Loadout & { id: string },
  ) {
    const p1 = this.prepareLoadout(playerOne);
    const p2 = this.prepareLoadout(playerTwo);

    const listeners: ListenerData[] = [
      ...this.scanForListeners(p1),
      ...this.scanForListeners(p2),
      ListenerFactory.createFatigue(p1.id).serialize(),
      ListenerFactory.createFatigue(p2.id).serialize(),
      ListenerFactory.createAdvanceTurn(p1.id).serialize(),
      ListenerFactory.createAdvanceTurn(p2.id).serialize(),
    ];

    this._state = {
      playerOne: p1,
      playerTwo: p2,
      turnQueue: TurnManager.initializeTurnQueue(
        { id: p1.id, speed: p1.speed },
        { id: p2.id, speed: p2.speed },
        10,
      ),
      listeners,
      gameOver: false,
    };
  }

  play(playerId: string, itemId: ItemId): void {
    if (this._state.gameOver) return;
    const itemDef = getItemBehavior(itemId);
    const state = this._state;

    const player =
      state.playerOne.id === playerId ? state.playerOne : state.playerTwo;
    const item = player.items.find((i) => i.id === itemId);
    const instanceId = item?.instanceId ?? itemId;

    const onPlayEvent: GameEvent = { type: 'on_play', playerId, itemId };

    const stateAfterOnPlay = this.processEvent(
      onPlayEvent,
      state.listeners,
      state,
    );
    // Preserve previous ordering: reactions first, then the on_play event itself
    this.log({ type: 'event', event: onPlayEvent } as LogEntry);

    const effects: Effect[] = [
      ActiveEffectLibrary.remove_item(instanceId),
      ...itemDef.onPlayEffects,
    ];

    const finalState = effects.reduce<EngineState>(
      (acc, effect) => {
        // Use the effect handler factory to process effects
        // This allows handlers to compute dynamic values based on game state
        const computedEvents = EffectHandlerFactory.processEffect(
          effect,
          acc,
          playerId,
        );

        // For effects, previous behavior logged the event BEFORE processing
        // Log each computed event
        for (const computedEvent of computedEvents) {
          this.log({ type: 'event', event: computedEvent } as LogEntry);
        }

        // Process all computed events through the normal event chain
        return computedEvents.reduce<EngineState>((innerAcc, effectEvent) => {
          return this.processEvent(effectEvent, innerAcc.listeners, innerAcc);
        }, acc);
      },
      {
        ...stateAfterOnPlay,
      },
    );

    this._state = finalState;
  }

  processEndOfTurn(playerId: string): void {
    if (this._state.gameOver) return;
    const turnEndEvent: GameEvent = {
      type: 'lifecycle',
      playerId,
      phase: 'on_turn_end',
    };
    this.processSimpleEvent(turnEndEvent);
  }

  processGameStart(): void {
    if (this._state.gameOver) return;
    const state = this._state;
    const gameStartEvent: GameEvent = {
      type: 'lifecycle',
      // use the current player from the turn queue
      playerId: state.turnQueue[0].playerId,
      phase: 'game_start',
    };
    this.processSimpleEvent(gameStartEvent);
  }

  processTurnStart(playerId: string): void {
    if (this._state.gameOver) return;
    const turnStartEvent: GameEvent = {
      type: 'lifecycle',
      playerId,
      phase: 'on_turn_start',
    };
    this.processSimpleEvent(turnStartEvent);
  }

  consumeLog(): LogEntry[] {
    const out = [...this.logBuffer];
    this.logBuffer.length = 0;
    return out;
  }

  private prepareLoadout(loadout: Loadout & { id: string }): EngineLoadout {
    return {
      ...loadout,
      items: loadout.items.map((item, index) => ({
        ...item,
        instanceId: item.instanceId ?? `${loadout.id}-${item.id}-${index}`,
      })),
    };
  }

  private scanForListeners(player: EngineLoadout): ListenerData[] {
    return player.items.flatMap((item) => {
      const itemDef = getItemBehavior(item.id);
      const effects = itemDef.passiveEffects ?? [];
      return effects.map((effect) =>
        ListenerFactory.createPassive(
          item.instanceId!,
          player.id,
          effect,
        ).serialize(),
      );
    });
  }

  private deserializeListener(data: ListenerData) {
    return ListenerFactory.deserialize(data);
  }

  private processEvent(
    event: GameEvent,
    listenersToProcess: ListenerData[],
    state: EngineState,
    depth = 0,
  ): EngineState {
    if (state.gameOver) return state;
    if (depth > 50) return state;

    if (listenersToProcess.length !== 0) {
      const [currentData, ...remaining] = listenersToProcess;
      const current = this.deserializeListener(currentData);
      const { event: resultEvent } = current.handle(event, state);
      // Serialize the listener after processing to persist any state changes (e.g., duration updates)
      const serializedCurrent = current.serialize();
      const processedState = resultEvent.reduce<EngineState>((acc, e) => {
        return this.processEvent(e, remaining, acc, depth + 1);
      }, state);
      // After all processing, update the listener in the state with its updated serialized form
      const updatedListeners = processedState.listeners.map((l) =>
        l.instanceId === serializedCurrent.instanceId ? serializedCurrent : l,
      );
      return {
        ...processedState,
        listeners: updatedListeners,
      };
    }
    // Basic effect processing via processors
    if (event.type === 'effect') {
      const processor =
        PROCESSORS[event.effect.type as keyof typeof PROCESSORS];
      if (processor) {
        const playerId = event.playerId;
        const playerKey =
          state.playerOne.id === playerId ? 'playerOne' : 'playerTwo';

        const effect = event.effect;
        // Process the effect
        const processed = processor(state, playerKey, effect);
        // Log the engine state change snapshot after processor application
        this.log({ type: 'state-change', snapshot: processed });
        // If the processor resulted in game over, log the game_over event as processors used to do
        if (!state.gameOver && processed.gameOver && processed.winnerId) {
          this.log({
            type: 'event',
            event: {
              type: 'lifecycle',
              playerId: processed.winnerId,
              phase: 'game_over',
            },
          });
        }
        return processed;
      }
    }
    return state;
  }

  // DRY helper for simple top-level events that only need logging + processing
  private processSimpleEvent(event: GameEvent): void {
    const state = this._state;
    if (state.gameOver) return;
    // Log first (previous behavior), then process
    this.log({ type: 'event', event } as LogEntry);
    const nextState = this.processEvent(event, state.listeners, state);
    this._state = nextState;
  }

  private log(entry: LogEntry): void {
    this.logBuffer.push(entry);
  }
}
