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
    ];

    this.engineStateSignal.set({
      playerOne: p1,
      playerTwo: p2,
      listeners,
    });
  }

  play(playerId: string, itemId: ItemId): LogEntry[] {
    const behavior = getItemBehavior(itemId);
    const state = this.engineStateSignal();

    const player =
      state.playerOne.id === playerId ? state.playerOne : state.playerTwo;
    const item = player.items.find((i) => i.id === itemId);
    const instanceId = item?.instanceId ?? itemId;

    const onPlayEvent: GameEvent = { type: 'on_play', playerId, itemId };

    const { state: stateAfterOnPlay, log: onPlayLog } = this.processEvent(
      onPlayEvent,
      state.listeners,
      state,
    );

    const effects: Effect[] = [
      removeItem(instanceId),
      ...behavior.whenPlayed(),
    ];

    const finalResult = effects.reduce<{ state: EngineState; log: LogEntry[] }>(
      (acc, effect) => {
        const effectEvent: GameEvent = { ...effect, playerId: playerId };
        const { state: nextState, log: effectLog } = this.processEvent(
          effectEvent,
          acc.state.listeners,
          acc.state,
        );
        return {
          state: nextState,
          log: [
            ...acc.log,
            { type: 'event', event: effectEvent },
            ...effectLog,
          ],
        };
      },
      {
        state: stateAfterOnPlay,
        log: [{ type: 'event', event: onPlayEvent }, ...onPlayLog],
      },
    );

    this.engineStateSignal.set(finalResult.state);
    return finalResult.log;
  }

  processEndOfTurn(playerId: string): LogEntry[] {
    const turnEndEvent: GameEvent = { type: 'on_turn_end', playerId };
    const state = this.engineStateSignal();
    const { state: nextState, log } = this.processEvent(
      turnEndEvent,
      state.listeners,
      state,
    );

    this.engineStateSignal.set(nextState);
    return [{ type: 'event', event: turnEndEvent }, ...log];
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
  ): { state: EngineState; log: LogEntry[] } {
    if (depth > 50) return { state, log: [] };

    if (listenersToProcess.length === 0) {
      // Basic effect processing via processors
      const processor = PROCESSORS[event.type];
      if (processor) {
        const playerId = event.playerId;
        const playerKey =
          state.playerOne.id === playerId ? 'playerOne' : 'playerTwo';

        const effect = event as Effect;
        const targetKey =
          effect.target === 'self'
            ? playerKey
            : playerKey === 'playerOne'
              ? 'playerTwo'
              : 'playerOne';
        const targetPlayerId = state[targetKey].id;

        return {
          state: processor(state, playerKey, effect),
          log: [{ type: 'processor', effect, targetPlayerId }],
        };
      }
      return { state, log: [] };
    }

    const [current, ...remaining] = listenersToProcess;
    const { event: resultEvent } = current.handle(event, state);

    let reactionLog: LogEntry[] = [];
    const isSameEvent = resultEvent.length === 1 && resultEvent[0] === event;

    if (!isSameEvent) {
      reactionLog.push({
        type: 'reaction',
        instanceId: current.instanceId,
        playerId: current.playerId,
        event,
      });
    }

    return resultEvent.reduce<{ state: EngineState; log: LogEntry[] }>(
      (acc, e) => {
        const { state: s, log: l } = this.processEvent(
          e,
          remaining,
          acc.state,
          depth + 1,
        );
        return { state: s, log: [...acc.log, ...l] };
      },
      { state, log: reactionLog },
    );
  }
}
