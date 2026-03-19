import { StatusEffect, Effect } from '../item';
import { TurnManager } from '../turn-manager';
import { createInitialListenerData, ListenerData } from './effects';
import {
  EngineState,
  GameEvent,
  GameEventStatus,
  ModifyStatusEffectPayload,
} from './engine.types';
import { GameEventFactory } from './game-event-factory';

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

  applyEffect(
    playerKey: 'playerOne' | 'playerTwo',
    effect: Effect,
  ): GameEvent | GameEvent[] {
    const { type } = effect;

    switch (type) {
      case 'damage':
        return this.applyDamage(playerKey, effect);
      case 'healing':
        return this.applyHealing(playerKey, effect);
      case 'speed_up':
        this.adjustStat(
          playerKey,
          'speed',
          effect.value as number,
          effect.target,
        );
        this.refreshTurnQueue();
        break;
      case 'slow_down':
        this.adjustStat(
          playerKey,
          'speed',
          -(effect.value as number),
          effect.target,
        );
        this.refreshTurnQueue();
        break;
      case 'remove_item':
        this.removeItem(playerKey, effect);
        break;
      case 'remove_listener':
        this.removeListener(effect);
        break;
      case 'add_status_effect':
        return this.addStatusEffect(playerKey, effect);
      case 'advance_turn':
        this.advanceTurn();
        break;
      case 'modify_status_effect':
        this.modifyStatusEffect(
          effect.value as unknown as ModifyStatusEffectPayload,
        );
        break;
    }

    return this.createDoneEvent(this._state[playerKey].id, effect);
  }

  private applyDamage(
    playerKey: 'playerOne' | 'playerTwo',
    effect: Effect,
  ): GameEvent | GameEvent[] {
    const targetKey = this.getTargetKey(playerKey, effect.target);
    const targetPlayer = this._state[targetKey];

    const actualDamage = Math.min(effect.value as number, targetPlayer.health);
    this._state[targetKey].health -= actualDamage;

    effect.value = actualDamage;

    const gameOverEvent = this.checkGameOver(targetKey);
    if (gameOverEvent) {
      return [
        this.createDoneEvent(this._state[playerKey].id, effect),
        gameOverEvent,
      ];
    }

    return this.createDoneEvent(this._state[playerKey].id, effect);
  }

  private applyHealing(
    playerKey: 'playerOne' | 'playerTwo',
    effect: Effect,
  ): GameEvent {
    const targetKey = this.getTargetKey(playerKey, effect.target);
    const targetPlayer = this._state[targetKey];

    const healthDeficit = targetPlayer.maxHealth - targetPlayer.health;
    const actualHealing = Math.min(effect.value as number, healthDeficit);
    this._state[targetKey].health += actualHealing;

    effect.value = actualHealing;

    return this.createDoneEvent(this._state[playerKey].id, effect);
  }

  modifyStatusEffect(payload: ModifyStatusEffectPayload): void {
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

  addStatusEffect(
    playerKey: 'playerOne' | 'playerTwo',
    effect: Effect,
  ): GameEvent {
    const targetKey = this.getTargetKey(playerKey, effect.target);
    const statusEffect = effect.value as StatusEffect;
    const targetPlayer = this._state[targetKey];
    const sourcePlayerId = this._state[playerKey].id;

    const mergeResult = this.mergeStatusEffect(targetPlayer.id, statusEffect);
    if (mergeResult) {
      return GameEventFactory.createModifyStatusEffect(
        sourcePlayerId,
        {
          instanceId: mergeResult.instanceId,
          charges: mergeResult.newCharges,
        },
        [],
        GameEventStatus.DONE,
      );
    }

    const instanceId = `buff-${targetPlayer.id}-${Date.now()}-${Math.random()}`;
    this._state.listeners.unshift(
      createInitialListenerData(instanceId, targetPlayer.id, statusEffect),
    );

    return this.createDoneEvent(sourcePlayerId, effect);
  }

  private createDoneEvent(playerId: string, effect: Effect): GameEvent {
    return {
      type: 'effect',
      playerId,
      effect,
      processedBy: [],
      status: GameEventStatus.DONE,
    };
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
  }

  private refreshTurnQueue(): void {
    this._state.turnQueue = TurnManager.recalculateTurnQueue(
      this._state.playerOne,
      this._state.playerTwo,
      this._state.turnQueue,
    );
  }

  private checkGameOver(
    targetKey: 'playerOne' | 'playerTwo',
  ): GameEvent | null {
    if (this._state[targetKey].health <= 0 && !this._state.gameOver) {
      const winnerKey = targetKey === 'playerOne' ? 'playerTwo' : 'playerOne';
      this._state.gameOver = true;
      this._state.winnerId = this._state[winnerKey].id;

      return GameEventFactory.createLifecycle(
        this._state[winnerKey].id,
        'game_over',
        [],
        GameEventStatus.DONE,
      );
    }
    return null;
  }

  private mergeStatusEffect(
    targetPlayerId: string,
    statusEffect: StatusEffect,
  ): { instanceId: string; newCharges: number } | null {
    if (
      statusEffect.mergeStrategy !== 'increase' ||
      statusEffect.duration?.type !== 'charges'
    ) {
      return null;
    }

    const existingListener = this._state.listeners.find(
      (listener) =>
        listener.playerId === targetPlayerId &&
        listener.effectState.effect.type === statusEffect.type &&
        listener.effectState.currentDuration.type === 'charges',
    );

    if (!existingListener) {
      return null;
    }

    const incomingCharges = statusEffect.duration.value as number;
    const newCharges =
      existingListener.effectState.currentDuration.remaining + incomingCharges;
    existingListener.effectState.currentDuration.remaining = newCharges;

    return {
      instanceId: existingListener.instanceId,
      newCharges,
    };
  }
}
