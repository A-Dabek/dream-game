import {
  GameEvent,
  GameEventStatus,
  EngineState,
  Listener,
} from './engine.types';
import { EngineStateManager } from './state-manager';
import { ListenerFactory } from './effects';
import { GameEventFactory } from './game-event-factory';

export interface LogCollector {
  logEvent(event: GameEvent): void;
  logStateChange(snapshot: EngineState): void;
}

export class EngineEventsProcessor {
  private readonly listenerCache = new Map<string, Listener>();
  private readonly stateManager = new EngineStateManager();

  constructor(private readonly logCollector: LogCollector) {}

  getState(): EngineState {
    return this.stateManager.getState();
  }

  setState(state: EngineState): void {
    this.stateManager.setState(state);
  }

  private getListener(type: string): Listener {
    let instance = this.listenerCache.get(type);
    if (!instance) {
      const Constructor = ListenerFactory.getConstructor(type);
      instance = new Constructor();
      this.listenerCache.set(type, instance);
    }
    return instance;
  }

  runEventLoop(initialEvents: GameEvent[]): void {
    let eventQueue = [...initialEvents];
    let iterations = 0;

    while (eventQueue.length > 0 && iterations < 100) {
      iterations++;

      const passResult = this.processListenersPass(eventQueue);
      eventQueue = passResult.events;

      const activeEvents = eventQueue.filter(
        (e) => e.status === GameEventStatus.PROGRESS,
      );

      eventQueue = eventQueue.filter(
        (e) =>
          e.status !== GameEventStatus.DONE &&
          e.status !== GameEventStatus.NULLIFIED,
      );

      for (const event of activeEvents) {
        this.applyProcessor(event);
      }

      if (this.stateManager.getState().gameOver) break;

      eventQueue = eventQueue.map((e) => ({
        ...e,
        status: this.getNextStatus(e.status),
      }));
    }
  }

  private processListenersPass(events: GameEvent[]): { events: GameEvent[] } {
    const nextPassQueue: GameEvent[] = [];

    for (const event of events) {
      const reactions = this.handleEventReactions(event);
      nextPassQueue.push(...reactions);
    }

    return { events: nextPassQueue };
  }

  private handleEventReactions(event: GameEvent): GameEvent[] {
    let currentEvent: GameEvent | null = event;
    const extraEvents: GameEvent[] = [];
    const originalProcessedBy = [...event.processedBy];

    let statusChanged = true;
    while (statusChanged && currentEvent) {
      statusChanged = false;

      const state = this.stateManager.getState();
      const listeners = state.listeners;

      for (let i = 0; i < listeners.length; i++) {
        if (!currentEvent) break;

        const currentState = this.stateManager.getState();
        const listenerData = currentState.listeners[i];

        const listener = this.getListener(listenerData.effectState.effect.type);
        if (!listener.canPossiblyReact(currentEvent, listenerData)) continue;

        const marker: string = `${listenerData.instanceId}-${currentEvent.status}`;
        if (currentEvent.processedBy.includes(marker)) continue;

        const { event: reactions, data: updatedData } = listener.handle(
          currentEvent,
          currentState,
          listenerData,
        );

        // Update currentState with updated listener data
        this.stateManager.updateListener(i, updatedData);

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

    return resultEvents;
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

  private applyProcessor(event: GameEvent): void {
    if (event.type !== 'effect') return;

    const state = this.stateManager.getState();
    const wasGameOver = state.gameOver;
    const playerKey =
      state.playerOne.id === event.playerId ? 'playerOne' : 'playerTwo';

    this.stateManager.applyEffect(playerKey, event.effect);

    const nextState = this.stateManager.getState();
    // Deep clone the state before logging to preserve snapshot at this point in time
    this.logCollector.logStateChange(EngineStateManager.cloneState(nextState));

    if (!wasGameOver && nextState.gameOver && nextState.winnerId) {
      this.logCollector.logEvent(
        GameEventFactory.createLifecycle(nextState.winnerId, 'game_over'),
      );
    }
  }

  reset(): void {
    this.listenerCache.clear();
  }
}
