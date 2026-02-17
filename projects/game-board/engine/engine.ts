import { computed, signal } from '@angular/core';
import { Effect, ItemId, Loadout, removeItem } from '../item';
import { getItemBehavior } from '../item-library';
import { TurnManager } from '../turn-manager';
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
  private readonly logBuffer: LogEntry[] = [];
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
      ListenerFactory.createAdvanceTurn(p1.id),
      ListenerFactory.createAdvanceTurn(p2.id),
    ];

    this.engineStateSignal.set({
      playerOne: p1,
      playerTwo: p2,
      turnQueue: TurnManager.initializeTurnQueue(
        { id: p1.id, speed: p1.speed },
        { id: p2.id, speed: p2.speed },
        10,
      ),
      listeners,
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
    // Preserve previous ordering: reactions first, then the on_play event itself
    this.log({ type: 'event', event: onPlayEvent } as LogEntry);

    const effects: Effect[] = [
      removeItem(instanceId),
      ...behavior.whenPlayed(),
    ];

    const finalState = effects.reduce<EngineState>(
      (acc, effect) => {
        const effectEvent: GameEvent = {
          type: 'effect',
          effect,
          playerId: playerId,
        };
        // For effects, previous behavior logged the event BEFORE processing
        this.log({ type: 'event', event: effectEvent } as LogEntry);
        return this.processEvent(effectEvent, acc.listeners, acc);
      },
      {
        ...stateAfterOnPlay,
      },
    );

    this.engineStateSignal.set(finalState);
  }

  processEndOfTurn(playerId: string): void {
    if (this.engineStateSignal().gameOver) return;
    const turnEndEvent: GameEvent = {
      type: 'lifecycle',
      playerId,
      phase: 'on_turn_end',
    };
    this.processSimpleEvent(turnEndEvent);
  }

  processGameStart(): void {
    if (this.engineStateSignal().gameOver) return;
    const state = this.engineStateSignal();
    const gameStartEvent: GameEvent = {
      type: 'lifecycle',
      // use the current player from the turn queue
      playerId: state.turnQueue[0].playerId,
      phase: 'game_start',
    };
    this.processSimpleEvent(gameStartEvent);
  }

  processTurnStart(playerId: string): void {
    if (this.engineStateSignal().gameOver) return;
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

    if (listenersToProcess.length !== 0) {
      const [current, ...remaining] = listenersToProcess;
      const { event: resultEvent } = current.handle(event, state);
      return resultEvent.reduce<EngineState>((acc, e) => {
        return this.processEvent(e, remaining, acc, depth + 1);
      }, state);
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
    const state = this.engineStateSignal();
    if (state.gameOver) return;
    // Log first (previous behavior), then process
    this.log({ type: 'event', event } as LogEntry);
    const nextState = this.processEvent(event, state.listeners, state);
    this.engineStateSignal.set(nextState);
  }

  private log(entry: LogEntry): void {
    this.logBuffer.push(entry);
  }
}
