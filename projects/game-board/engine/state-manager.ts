import { StatusEffect, Effect } from '../item';
import { TurnManager } from '../turn-manager';
import { createInitialListenerData, ListenerData } from './effects';
import { EngineState } from './engine.types';

export class EngineStateManager {
  private _state!: EngineState;

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

  applyEffect(playerKey: 'playerOne' | 'playerTwo', effect: Effect): void {
    const { type, value, target } = effect;

    switch (type) {
      case 'damage':
        this.adjustStat(playerKey, 'health', -(value as number), target);
        break;
      case 'healing':
        this.adjustStat(playerKey, 'health', value as number, target);
        break;
      case 'speed_up':
        this.adjustStat(playerKey, 'speed', value as number, target);
        this.refreshTurnQueue();
        break;
      case 'slow_down':
        this.adjustStat(playerKey, 'speed', -(value as number), target);
        this.refreshTurnQueue();
        break;
      case 'remove_item':
        this.removeItem(playerKey, effect);
        break;
      case 'remove_listener':
        this.removeListener(effect);
        break;
      case 'add_status_effect':
        this.addStatusEffect(playerKey, effect);
        break;
      case 'advance_turn':
        this.advanceTurn();
        break;
      case 'modify_status_effect':
        this.modifyStatusEffect(
          effect.value as unknown as {
            instanceId: string;
            charges?: number;
            extraParams?: Record<string, unknown>;
          },
        );
        break;
    }
  }

  modifyStatusEffect(payload: {
    instanceId: string;
    charges?: number;
    extraParams?: Record<string, unknown>;
  }): void {
    const listener = this._state.listeners.find(
      (l) => l.instanceId === payload.instanceId,
    );
    if (!listener) {
      return;
    }

    if (payload.charges !== undefined) {
      listener.effectState.currentDuration.remaining = payload.charges;
    }

    if (payload.extraParams !== undefined) {
      listener.effectState.effect = {
        ...listener.effectState.effect,
        extraParams: {
          ...(listener.effectState.effect.extraParams || {}),
          ...payload.extraParams,
        },
      };
    }
  }

  removeItem(playerKey: 'playerOne' | 'playerTwo', effect: Effect): void {
    const targetKey = this.getTargetKey(playerKey, effect.target);
    const items = this._state[targetKey].items;
    const instanceId = effect.value as string;
    const updatedItems = items.filter((item) => item.instanceId !== instanceId);
    if (updatedItems.length !== items.length) {
      this._state[targetKey].items = updatedItems;
    }
  }

  removeListener(effect: Effect): void {
    const instanceId = effect.value as string;
    this._state.listeners = this._state.listeners.filter(
      (l) => l.instanceId !== instanceId,
    );
  }

  addStatusEffect(playerKey: 'playerOne' | 'playerTwo', effect: Effect): void {
    const targetKey = this.getTargetKey(playerKey, effect.target);
    const statusEffect = effect.value as StatusEffect;
    const targetPlayer = this._state[targetKey];

    const merged = this.mergeStatusEffect(targetPlayer.id, statusEffect);
    if (merged) {
      return;
    }

    // Default behavior: create new listener
    this._state.listeners.unshift(
      createInitialListenerData(
        `buff-${targetPlayer.id}-${Date.now()}-${Math.random()}`,
        targetPlayer.id,
        statusEffect,
      ),
    );
  }

  advanceTurn(): void {
    this._state.turnQueue = TurnManager.advanceTurnQueue(
      this._state.playerOne,
      this._state.playerTwo,
      this._state.turnQueue,
      1,
    );
  }

  updateListener(index: number, data: ListenerData): void {
    this._state.listeners[index] = data;
  }

  updateAllListeners(listeners: ListenerData[]): void {
    this._state.listeners = listeners;
  }

  private getTargetKey(
    playerKey: 'playerOne' | 'playerTwo',
    target: 'self' | 'enemy' = 'enemy',
  ): 'playerOne' | 'playerTwo' {
    if (target === 'self') {
      return playerKey;
    }
    return playerKey === 'playerOne' ? 'playerTwo' : 'playerOne';
  }

  private adjustStat(
    playerKey: 'playerOne' | 'playerTwo',
    stat: 'health' | 'speed',
    delta: number,
    target?: 'self' | 'enemy',
  ): void {
    const targetKey = this.getTargetKey(playerKey, target);
    this._state[targetKey][stat] += delta;
    if (stat === 'health') {
      this.checkGameOver(targetKey);
    }
  }

  private refreshTurnQueue(): void {
    this._state.turnQueue = TurnManager.recalculateTurnQueue(
      this._state.playerOne,
      this._state.playerTwo,
      this._state.turnQueue,
    );
  }

  private checkGameOver(targetKey: 'playerOne' | 'playerTwo'): void {
    if (this._state[targetKey].health <= 0 && !this._state.gameOver) {
      const winnerKey = targetKey === 'playerOne' ? 'playerTwo' : 'playerOne';
      this._state.gameOver = true;
      this._state.winnerId = this._state[winnerKey].id;
    }
  }

  private mergeStatusEffect(
    targetPlayerId: string,
    statusEffect: StatusEffect,
  ): boolean {
    if (
      statusEffect.mergeStrategy !== 'increase' ||
      statusEffect.duration?.type !== 'charges'
    ) {
      return false;
    }

    const existingListener = this._state.listeners.find(
      (listener) =>
        listener.playerId === targetPlayerId &&
        listener.effectState.effect.type === statusEffect.type &&
        listener.effectState.currentDuration.type === 'charges',
    );

    if (!existingListener) {
      return false;
    }

    const incomingCharges = statusEffect.duration.value as number;
    existingListener.effectState.currentDuration.remaining += incomingCharges;

    return true;
  }
}
