import { ActiveEffectLibrary } from '../effect-library';
import { Effect, ItemId, Loadout } from '../item';
import { getItemBehavior } from '../item-library';
import { TurnManager } from '../turn-manager';
import { EffectHandlerFactory, ListenerData, ListenerFactory } from './effects';
import {
  EngineLoadout,
  EngineState,
  GameActionType,
  GameEvent,
  GameEventFactory,
  LogEntry,
} from './engine.model';
import { EngineEventsProcessor, LogCollector } from './events-processor';
import { EngineStateManager } from './state-manager';

export class Engine implements LogCollector {
  private readonly logBuffer: LogEntry[] = [];
  private readonly eventsProcessor: EngineEventsProcessor;

  constructor(
    playerOne: Loadout & { id: string },
    playerTwo: Loadout & { id: string },
  ) {
    this.eventsProcessor = new EngineEventsProcessor(this);
    const p1 = this.prepareLoadout(playerOne);
    const p2 = this.prepareLoadout(playerTwo);

    this.eventsProcessor.setState({
      playerOne: p1,
      playerTwo: p2,
      turnQueue: TurnManager.initializeTurnQueue(
        { id: p1.id, speed: p1.speed },
        { id: p2.id, speed: p2.speed },
        10,
      ),
      listeners: this.initializeListeners(p1, p2),
      gameOver: false,
      actionHistory: [],
    });
  }

  get state(): EngineState {
    return this.eventsProcessor.getState();
  }

  play(playerId: string, itemId: ItemId): void {
    if (this.state.gameOver) return;

    this.state.actionHistory.push({
      type: GameActionType.PLAY_ITEM,
      playerId,
      itemId,
    });

    const state = this.state;
    const player =
      state.playerOne.id === playerId ? state.playerOne : state.playerTwo;
    const item = player.items.find((i) => i.id === itemId);
    const instanceId = item?.instanceId ?? itemId;

    const onPlayEvent = GameEventFactory.createOnPlay(playerId, itemId);
    this.logEvent(onPlayEvent);
    this.eventsProcessor.runEventLoop([onPlayEvent]);

    const itemDef = getItemBehavior(itemId);
    const effects: Effect[] = [
      ActiveEffectLibrary.remove_item(instanceId),
      ...itemDef.onPlayEffects,
    ];

    for (const effect of effects) {
      this.processItemEffect(effect, playerId);
    }
  }

  pass(playerId: string): void {
    if (this.state.gameOver) return;

    this.state.actionHistory.push({
      type: GameActionType.PLAY_ITEM,
      playerId,
      itemId: undefined,
    });

    this.processEndOfTurn(playerId);
  }

  surrender(playerId: string): void {
    if (this.state.gameOver) return;

    const state = this.state;
    const winnerId =
      state.playerOne.id === playerId ? state.playerTwo.id : state.playerOne.id;

    state.gameOver = true;
    state.winnerId = winnerId;

    state.actionHistory.push({
      type: GameActionType.SURRENDER,
      playerId,
    });
  }

  processEndOfTurn(playerId: string): void {
    if (this.state.gameOver) return;
    const turnEndEvent = GameEventFactory.createLifecycle(
      playerId,
      'on_turn_end',
    );
    this.processSimpleEvent(turnEndEvent);
  }

  processGameStart(): void {
    if (this.state.gameOver) return;
    const state = this.state;
    const gameStartEvent = GameEventFactory.createLifecycle(
      state.turnQueue[0].playerId,
      'game_start',
    );
    this.processSimpleEvent(gameStartEvent);
  }

  processTurnStart(playerId: string): void {
    if (this.state.gameOver) return;
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
   * Returns the internal log buffer without clearing it.
   * Useful for testing state snapshot integrity.
   */
  peekLog(): readonly LogEntry[] {
    return [...this.logBuffer];
  }

  /**
   * Resets the engine to a specific state.
   */
  reset(state: EngineState): void {
    this.eventsProcessor.setState(state);
    this.eventsProcessor.reset();
    this.logBuffer.length = 0;
  }

  /**
   * Creates a deep clone of the engine, including its current state.
   */
  clone(): Engine {
    const state = this.state;
    const cloned = new Engine(state.playerOne, state.playerTwo);

    // Reset to the deep-cloned state to avoid reference sharing
    cloned.reset(EngineStateManager.cloneState(state));

    return cloned;
  }

  // LogCollector implementation
  logEvent(event: GameEvent): void {
    this.logBuffer.push({ type: 'event', event });
  }

  logStateChange(snapshot: EngineState): void {
    this.logBuffer.push({ type: 'state-change', snapshot });
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

  private processItemEffect(effect: Effect, playerId: string): void {
    const computedEvents = EffectHandlerFactory.processEffect(
      effect,
      this.state,
      playerId,
    );

    for (const event of computedEvents) {
      this.logEvent(event);
    }

    this.eventsProcessor.runEventLoop(computedEvents);
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

  private processSimpleEvent(event: GameEvent): void {
    if (this.state.gameOver) return;
    this.logEvent(event);
    this.eventsProcessor.runEventLoop([event]);
  }
}
