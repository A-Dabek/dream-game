import { ActiveEffectLibrary } from '../effect-library';
import { Effect, ItemId, Loadout } from '../item';
import { getItemBehavior } from '../item-library';
import { TurnManager } from '../turn-manager';
import { EffectHandlerFactory, ListenerData, ListenerFactory } from './effects';
import {
  GameEventFactory,
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

    this._state = {
      playerOne: p1,
      playerTwo: p2,
      turnQueue: TurnManager.initializeTurnQueue(
        { id: p1.id, speed: p1.speed },
        { id: p2.id, speed: p2.speed },
        10,
      ),
      listeners: this.initializeListeners(p1, p2),
      gameOver: false,
    };
  }

  private initializeListeners(
    p1: EngineLoadout,
    p2: EngineLoadout,
  ): ListenerData[] {
    return [
      ...this.scanForListeners(p1),
      ...this.scanForListeners(p2),
      ListenerFactory.createFatigue(p1.id).serialize(),
      ListenerFactory.createFatigue(p2.id).serialize(),
      ListenerFactory.createAdvanceTurn(p1.id).serialize(),
      ListenerFactory.createAdvanceTurn(p2.id).serialize(),
    ];
  }

  play(playerId: string, itemId: ItemId): void {
    if (this._state.gameOver) return;

    const state = this._state;
    const player =
      state.playerOne.id === playerId ? state.playerOne : state.playerTwo;
    const item = player.items.find((i) => i.id === itemId);
    const instanceId = item?.instanceId ?? itemId;

    const onPlayEvent = GameEventFactory.createOnPlay(playerId, itemId);
    const stateAfterOnPlay = this.processEvent(
      onPlayEvent,
      state.listeners,
      state,
    );
    this.log({ type: 'event', event: onPlayEvent });

    const itemDef = getItemBehavior(itemId);
    const effects: Effect[] = [
      ActiveEffectLibrary.remove_item(instanceId),
      ...itemDef.onPlayEffects,
    ];

    this._state = effects.reduce<EngineState>(
      (acc, effect) => this.processItemEffect(effect, acc, playerId),
      stateAfterOnPlay,
    );
  }

  private processItemEffect(
    effect: Effect,
    state: EngineState,
    playerId: string,
  ): EngineState {
    const computedEvents = EffectHandlerFactory.processEffect(
      effect,
      state,
      playerId,
    );

    for (const event of computedEvents) {
      this.log({ type: 'event', event });
    }

    return computedEvents.reduce<EngineState>(
      (acc, event) => this.processEvent(event, acc.listeners, acc),
      state,
    );
  }

  processEndOfTurn(playerId: string): void {
    if (this._state.gameOver) return;
    const turnEndEvent = GameEventFactory.createLifecycle(
      playerId,
      'on_turn_end',
    );
    this.processSimpleEvent(turnEndEvent);
  }

  processGameStart(): void {
    if (this._state.gameOver) return;
    const state = this._state;
    const gameStartEvent = GameEventFactory.createLifecycle(
      state.turnQueue[0].playerId,
      'game_start',
    );
    this.processSimpleEvent(gameStartEvent);
  }

  processTurnStart(playerId: string): void {
    if (this._state.gameOver) return;
    const turnStartEvent = GameEventFactory.createLifecycle(
      playerId,
      'on_turn_start',
    );
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

  private processEvent(
    event: GameEvent,
    listenersToProcess: ListenerData[],
    state: EngineState,
    depth = 0,
  ): EngineState {
    // TODO there should be a warning or error if we hit the depth limit, but for now we'll just return the current state to prevent infinite loops
    if (state.gameOver || depth > 50) return state;

    if (listenersToProcess.length > 0) {
      return this.processListeners(event, listenersToProcess, state, depth);
    }

    return this.applyProcessor(event, state);
  }

  private processListeners(
    event: GameEvent,
    [currentData, ...remaining]: ListenerData[],
    state: EngineState,
    depth: number,
  ): EngineState {
    if (event.processedBy?.includes(currentData.instanceId)) {
      return this.processEvent(event, remaining, state, depth);
    }

    const listener = ListenerFactory.deserialize(currentData);
    const { event: reactionEventsRaw } = listener.handle(event, state);

    // Serialize the listener AFTER handling to capture any duration changes
    const serializedListener = listener.serialize();
    const stateWithUpdatedListener = {
      ...state,
      listeners: state.listeners.map((l) =>
        l.instanceId === serializedListener.instanceId ? serializedListener : l,
      ),
    };

    const reactionEvents = reactionEventsRaw.map((e) =>
      GameEventFactory.create({
        ...e,
        processedBy: Array.from(
          new Set([...(e.processedBy ?? []), currentData.instanceId]),
        ),
      }),
    );

    // Restart processing for all resulting events from the BEGINNING of the listener chain
    return reactionEvents.reduce<EngineState>(
      (acc, e) => this.processEvent(e, acc.listeners, acc, depth + 1),
      stateWithUpdatedListener,
    );
  }

  private applyProcessor(event: GameEvent, state: EngineState): EngineState {
    if (event.type !== 'effect') return state;

    const processor = PROCESSORS[event.effect.type as keyof typeof PROCESSORS];
    if (!processor) return state;

    const playerKey =
      state.playerOne.id === event.playerId ? 'playerOne' : 'playerTwo';
    const nextState = processor(state, playerKey, event.effect);

    this.log({ type: 'state-change', snapshot: nextState });

    if (!state.gameOver && nextState.gameOver && nextState.winnerId) {
      this.log({
        type: 'event',
        event: GameEventFactory.createLifecycle(
          nextState.winnerId,
          'game_over',
        ),
      });
    }

    return nextState;
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

  /**
   * Creates a deep clone of the engine, including its current state.
   * The clone will have its own state and an empty log buffer.
   */
  clone(): Engine {
    const cloned = Object.create(Engine.prototype);
    const state = this._state;

    // Fast manual deep clone of the engine state
    cloned._state = {
      playerOne: {
        ...state.playerOne,
        items: state.playerOne.items.map((i) => ({ ...i })),
      },
      playerTwo: {
        ...state.playerTwo,
        items: state.playerTwo.items.map((i) => ({ ...i })),
      },
      turnQueue: state.turnQueue.map((t) => ({ ...t })),
      listeners: state.listeners.map((l) => ({
        ...l,
        effectState: {
          ...l.effectState,
          currentDuration: { ...l.effectState.currentDuration },
        },
      })),
      gameOver: state.gameOver,
      winnerId: state.winnerId,
    };

    // Initialize private readonly logBuffer for the cloned instance.
    Object.defineProperty(cloned, 'logBuffer', {
      value: [],
      writable: false,
      configurable: true,
    });
    return cloned;
  }
}
