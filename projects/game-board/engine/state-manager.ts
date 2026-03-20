import { Effect } from '../item';
import { ListenerData } from './effects';
import { EngineState, GameEvent } from './engine.types';
import {
  StateEffectHandlerRegistry,
  DamageHandler,
  HealingHandler,
  SpeedUpHandler,
  SlowDownHandler,
  RemoveItemHandler,
  RemoveListenerHandler,
  AddStatusEffectHandler,
  AdvanceTurnHandler,
  ModifyStatusEffectHandler,
} from './state-effects';

export class EngineStateManager {
  private _state!: EngineState;
  private readonly effectRegistry = new StateEffectHandlerRegistry();

  constructor() {
    // Register all effect handlers
    this.effectRegistry.register(new DamageHandler());
    this.effectRegistry.register(new HealingHandler());
    this.effectRegistry.register(new SpeedUpHandler());
    this.effectRegistry.register(new SlowDownHandler());
    this.effectRegistry.register(new RemoveItemHandler());
    this.effectRegistry.register(new RemoveListenerHandler());
    this.effectRegistry.register(new AddStatusEffectHandler());
    this.effectRegistry.register(new AdvanceTurnHandler());
    this.effectRegistry.register(new ModifyStatusEffectHandler());
  }

  static cloneState(state: EngineState): EngineState {
    return {
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
      actionHistory: state.actionHistory.map((a) => ({ ...a })),
    };
  }

  getState(): EngineState {
    return this._state;
  }

  setState(state: EngineState): void {
    this._state = state;
  }

  applyEffect(
    playerKey: 'playerOne' | 'playerTwo',
    effect: Effect,
  ): GameEvent | GameEvent[] {
    return this.effectRegistry.handle(this._state, playerKey, effect);
  }

  updateListener(index: number, data: ListenerData): void {
    this._state.listeners[index] = data;
  }
}
