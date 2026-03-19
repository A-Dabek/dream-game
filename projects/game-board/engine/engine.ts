import { ActiveEffectLibrary } from '../effect-library';
import { Effect, ItemId, Loadout } from '../item';
import { getItemBehavior } from '../item-library';
import { TurnManager } from '../turn-manager';
import { EffectHandlerFactory, ListenerData, ListenerFactory } from './effects';
import {
  EngineLoadout,
  EngineState,
  GameEvent,
  GameEventFactory,
  GameEventStatus,
  LogEntry,
  Listener,
} from './engine.model';
import { PROCESSORS } from './processors';

export class Engine {
  private readonly logBuffer: LogEntry[] = [];
  private readonly listenerCache = new Map<string, Listener>();

  private getListener(type: string): Listener {
    let instance = this.listenerCache.get(type);
    if (!instance) {
      const Constructor = ListenerFactory.getConstructor(type);
      instance = new Constructor();
      this.listenerCache.set(type, instance);
    }
    return instance;
  }

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

  private _state: EngineState = null!;

  get state(): EngineState {
    return this._state;
  }

  play(playerId: string, itemId: ItemId): void {
    if (this._state.gameOver) return;

    const state = this._state;
    const player =
      state.playerOne.id === playerId ? state.playerOne : state.playerTwo;
    const item = player.items.find((i) => i.id === itemId);
    const instanceId = item?.instanceId ?? itemId;

    const onPlayEvent = GameEventFactory.createOnPlay(playerId, itemId);
    this.log({ type: 'event', event: onPlayEvent });
    const stateAfterOnPlay = this.runEventLoop([onPlayEvent], state);

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

    // Initialize listenerCache for the cloned instance.
    Object.defineProperty(cloned, 'listenerCache', {
      value: new Map<string, Listener>(),
      writable: false,
      configurable: true,
    });

    return cloned;
  }

  private initializeListeners(
    p1: EngineLoadout,
    p2: EngineLoadout,
  ): ListenerData[] {
    return [
      ...this.scanForListeners(p1),
      ...this.scanForListeners(p2),
      ListenerFactory.createFatigueData(p1.id),
      ListenerFactory.createFatigueData(p2.id),
      ListenerFactory.createAdvanceTurnData(p1.id),
      ListenerFactory.createAdvanceTurnData(p2.id),
    ];
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

    return this.runEventLoop(computedEvents, state);
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
        ListenerFactory.createPassiveData(item.instanceId!, player.id, effect),
      );
    });
  }

  private runEventLoop(
    initialEvents: GameEvent[],
    state: EngineState,
  ): EngineState {
    let eventQueue = [...initialEvents];
    let currentState = state;
    let iterations = 0;

    while (eventQueue.length > 0 && iterations < 100) {
      iterations++;

      const passResult = this.processListenersPass(eventQueue, currentState);
      eventQueue = passResult.events;
      currentState = passResult.state;

      const activeEvents = eventQueue.filter(
        (e) => e.status === GameEventStatus.PROGRESS,
      );

      eventQueue = eventQueue.filter(
        (e) =>
          e.status !== GameEventStatus.DONE &&
          e.status !== GameEventStatus.NULLIFIED,
      );

      for (const event of activeEvents) {
        currentState = this.applyProcessor(event, currentState);
      }

      if (currentState.gameOver) break;

      eventQueue = eventQueue.map((e) => ({
        ...e,
        status: this.getNextStatus(e.status),
      }));
    }

    return currentState;
  }

  private processListenersPass(
    events: GameEvent[],
    state: EngineState,
  ): { events: GameEvent[]; state: EngineState } {
    let currentState = state;
    const nextPassQueue: GameEvent[] = [];

    for (const event of events) {
      const { events: reactions, state: updatedState } =
        this.handleEventReactions(event, currentState);
      currentState = updatedState;
      nextPassQueue.push(...reactions);
    }

    return { events: nextPassQueue, state: currentState };
  }

  private handleEventReactions(
    event: GameEvent,
    state: EngineState,
  ): { events: GameEvent[]; state: EngineState } {
    let currentState = state;
    let currentEvent: GameEvent | null = event;
    const extraEvents: GameEvent[] = [];
    const originalProcessedBy = [...event.processedBy];

    // Status change loop: if any listener transforms the event status,
    // we restart the pass to allow all listeners to react to the new status.
    // Recursion is prevented by the 'marker' in currentEvent.processedBy.
    let statusChanged = true;
    while (statusChanged && currentEvent) {
      statusChanged = false;

      const listeners = currentState.listeners;
      for (let i = 0; i < listeners.length; i++) {
        const listenerData = listeners[i];
        if (!currentEvent) break;

        const listener = this.getListener(listenerData.effectState.effect.type);
        if (!listener) continue;

        // Skip listeners that cannot possibly react to this event status
        if (!listener.canPossiblyReact(currentEvent, listenerData)) continue;

        const marker: string = `${listenerData.instanceId}-${currentEvent.status}`;
        if (currentEvent.processedBy.includes(marker)) continue;

        const { event: reactions, data: updatedData } = listener.handle(
          currentEvent,
          currentState,
          listenerData,
        );

        // Update currentState with updated listener data
        const updatedListeners = [...currentState.listeners];
        updatedListeners[i] = updatedData;
        currentState = {
          ...currentState,
          listeners: updatedListeners,
        };

        if (reactions.length <= 0) {
          currentEvent = null;
          break;
        }

        const transformation = reactions[0];
        const oldStatus = currentEvent.status;

        currentEvent = {
          ...transformation,
          processedBy: [...(transformation.processedBy ?? []), marker],
        };

        // Collect extra events from this reaction
        for (let j = 1; j < reactions.length; j++) {
          extraEvents.push(
            GameEventFactory.create({
              ...reactions[j],
              processedBy: [...originalProcessedBy, marker],
              status: GameEventStatus.NEW,
            }),
          );
        }

        if (currentEvent.status !== oldStatus) {
          statusChanged = true;
          break; // Restart the listener loop for the new status
        }
      }
    }

    const resultEvents: GameEvent[] = [];
    if (currentEvent) {
      resultEvents.push(currentEvent);
    }
    resultEvents.push(...extraEvents);

    return { events: resultEvents, state: currentState };
  }

  private getNextStatus(status: GameEventStatus): GameEventStatus {
    switch (status) {
      case GameEventStatus.NEW:
        return GameEventStatus.PROGRESS;
      case GameEventStatus.PROGRESS:
        return GameEventStatus.DONE;
      case GameEventStatus.NULLIFY:
        return GameEventStatus.NULLIFIED;
      default:
        return status;
    }
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
    const nextState = this.runEventLoop([event], state);
    this._state = nextState;
  }

  private log(entry: LogEntry): void {
    this.logBuffer.push(entry);
  }
}
