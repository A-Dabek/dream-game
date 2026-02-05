import { computed, signal } from '@angular/core';
import { Effect, getItemBehavior, ItemId, Loadout, removeItem } from '../item';
import { ListenerFactory } from './effects';
import {
  EngineLoadout,
  EngineState,
  GameEvent,
  Listener,
  LogEntry,
} from './engine.model';
import { PROCESSORS } from './processors';

export class Engine {
  private readonly engineStateSignal = signal<EngineState>(null!);

  readonly state = computed(() => this.engineStateSignal());

  constructor(
    playerOne: Loadout & { id: string },
    playerTwo: Loadout & { id: string },
  ) {
    const p1 = this.prepareLoadout(playerOne);
    const p2 = this.prepareLoadout(playerTwo);

    const listeners = [
      ...this.scanForListeners(p1),
      ...this.scanForListeners(p2),
      ListenerFactory.createFatigue(p1.id),
      ListenerFactory.createFatigue(p2.id),
    ];

    this.engineStateSignal.set({
      playerOne: p1,
      playerTwo: p2,
      listeners,
      log: [],
      gameOver: false,
    });
  }

  play(playerId: string, itemId: ItemId): void {
    if (this.engineStateSignal().gameOver) return;
    const behavior = getItemBehavior(itemId);
    const state = this.engineStateSignal();

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

    const effects: Effect[] = [
      removeItem(instanceId),
      ...behavior.whenPlayed(),
    ];

    const finalState = effects.reduce<EngineState>(
      (acc, effect) => {
        const effectEvent: GameEvent = { ...effect, playerId: playerId };
        const stateWithEventLog = {
          ...acc,
          log: [...acc.log, { type: 'event', event: effectEvent } as LogEntry],
        };
        return this.processEvent(
          effectEvent,
          stateWithEventLog.listeners,
          stateWithEventLog,
        );
      },
      {
        ...stateAfterOnPlay,
        log: [
          ...stateAfterOnPlay.log,
          { type: 'event', event: onPlayEvent } as LogEntry,
        ],
      },
    );

    this.engineStateSignal.set(finalState);
  }

  processEndOfTurn(playerId: string): void {
    if (this.engineStateSignal().gameOver) return;
    const turnEndEvent: GameEvent = { type: 'on_turn_end', playerId };
    this.processSimpleEvent(turnEndEvent);
  }

  processGameStart(): void {
    if (this.engineStateSignal().gameOver) return;
    const gameStartEvent: GameEvent = { type: 'game_start' };
    this.processSimpleEvent(gameStartEvent);
  }

  processTurnStart(playerId: string): void {
    if (this.engineStateSignal().gameOver) return;
    const turnStartEvent: GameEvent = { type: 'on_turn_start', playerId };
    this.processSimpleEvent(turnStartEvent);
  }

  consumeLog(): LogEntry[] {
    const state = this.engineStateSignal();
    const log = [...state.log];
    this.engineStateSignal.set({
      ...state,
      log: [],
    });
    return log;
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

  private scanForListeners(player: EngineLoadout): Listener[] {
    return player.items.flatMap((item) => {
      const behavior = getItemBehavior(item.id);
      const effects = behavior.passiveEffects?.() ?? [];
      return effects.map((effect) =>
        ListenerFactory.createPassive(item.instanceId!, player.id, effect),
      );
    });
  }

  private processEvent(
    event: GameEvent,
    listenersToProcess: Listener[],
    state: EngineState,
    depth = 0,
  ): EngineState {
    if (state.gameOver) return state;
    if (depth > 50) return state;

    if (listenersToProcess.length === 0) {
      // Basic effect processing via processors
      const processor = PROCESSORS[event.type];
      if (processor && 'playerId' in event && event.playerId) {
        const playerId = event.playerId;
        const playerKey =
          state.playerOne.id === playerId ? 'playerOne' : 'playerTwo';

        const effect = event as Effect;
        return processor(state, playerKey, effect);
      }
      return state;
    }

    const [current, ...remaining] = listenersToProcess;
    const { event: resultEvent } = current.handle(event, state);

    let nextState = state;
    const isSameEvent = resultEvent.length === 1 && resultEvent[0] === event;

    if (!isSameEvent) {
      nextState = {
        ...state,
        log: [
          ...state.log,
          {
            type: 'reaction',
            instanceId: current.instanceId,
            playerId: current.playerId,
            event,
          },
        ],
      };
    }

    return resultEvent.reduce<EngineState>((acc, e) => {
      return this.processEvent(e, remaining, acc, depth + 1);
    }, nextState);
  }

  // DRY helper for simple top-level events that only need logging + processing
  private processSimpleEvent(event: GameEvent): void {
    const state = this.engineStateSignal();
    if (state.gameOver) return;
    const stateWithEventLog = {
      ...state,
      log: [...state.log, { type: 'event', event } as LogEntry],
    };
    const nextState = this.processEvent(
      event,
      stateWithEventLog.listeners,
      stateWithEventLog,
    );
    this.engineStateSignal.set(nextState);
  }
}
