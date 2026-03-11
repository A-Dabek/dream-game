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

    const onPlayEvent: GameEvent = { type: 'on_play', playerId, itemId };
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
    const listener = this.deserializeListener(currentData);
    const { event: reactionEvents } = listener.handle(event, state);
    // Serialize the listener AFTER handling to capture any duration changes
    const serializedListener = listener.serialize();

    // Update the state with the serialized listener before processing reactions
    // This ensures processors see the updated duration
    const stateWithUpdatedListener = {
      ...state,
      listeners: state.listeners.map((l) =>
        l.instanceId === serializedListener.instanceId ? serializedListener : l,
      ),
    };

    const stateAfterReactions = reactionEvents.reduce<EngineState>(
      (acc, e) => this.processEvent(e, remaining, acc, depth + 1),
      stateWithUpdatedListener,
    );

    return stateAfterReactions;
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
        event: {
          type: 'lifecycle',
          playerId: nextState.winnerId,
          phase: 'game_over',
        },
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
}
