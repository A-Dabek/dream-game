import {attack, Effect, ItemId, PassiveEffect} from '../item';
import {DefaultPassiveInstance, PassiveInstance} from './effects';
import {EngineState} from './engine.model';

export type EffectProcessor = (
  state: EngineState,
  playerKey: 'playerOne' | 'playerTwo',
  effect: Effect
) => EngineState | Effect[];

export const PROCESSORS: Record<string, EffectProcessor> = {
  damage: (state, playerKey, effect) => {
    return [{...effect, type: 'apply_damage'}];
  },
  apply_damage: (state, playerKey, effect) => {
    const targetKey = effect.target === 'self' ? playerKey : (playerKey === 'playerOne' ? 'playerTwo' : 'playerOne');
    return {
      ...state,
      [targetKey]: {
        ...state[targetKey],
        health: state[targetKey].health - (effect.value as number),
      },
    };
  },
  remove_item: (state, playerKey, effect) => {
    const targetKey = effect.target === 'enemy' ? (playerKey === 'playerOne' ? 'playerTwo' : 'playerOne') : playerKey;
    const target = state[targetKey];
    const itemIndex = target.items.findIndex((item) => item.id === (effect.value as ItemId));

    if (itemIndex === -1) {
      return state;
    }

    const itemToRemove = target.items[itemIndex];
    const updatedItems = [...target.items];
    updatedItems.splice(itemIndex, 1);

    const updatedPassiveEffects = state.passiveEffects.filter((pe) => pe.instanceId !== itemToRemove.instanceId);

    return {
      ...state,
      [targetKey]: {
        ...target,
        items: updatedItems,
      },
      passiveEffects: updatedPassiveEffects,
    };
  },
  healing: (state, playerKey, effect) => {
    const targetKey = effect.target === 'enemy' ? (playerKey === 'playerOne' ? 'playerTwo' : 'playerOne') : playerKey;
    return {
      ...state,
      [targetKey]: {
        ...state[targetKey],
        health: state[targetKey].health + (effect.value as number),
      },
    };
  },
  add_passive_attack: (state, playerKey, effect) => {
    const targetKey = effect.target === 'enemy' ? (playerKey === 'playerOne' ? 'playerTwo' : 'playerOne') : playerKey;
    return {
      ...state,
      [targetKey]: {
        ...state[targetKey],
        endOfTurnEffects: [...state[targetKey].endOfTurnEffects, {...effect, type: 'passive_attack'}],
      },
    };
  },
  passive_attack: (state, playerKey, effect) => [attack(effect.value as number)],
  add_passive_effect: (state, playerKey, effect) => {
    const targetKey = effect.target === 'enemy' ? (playerKey === 'playerOne' ? 'playerTwo' : 'playerOne') : playerKey;
    const passiveEffect = effect.value as PassiveEffect;
    const targetPlayer = state[targetKey];
    return {
      ...state,
      passiveEffects: [
        ...state.passiveEffects,
        DefaultPassiveInstance.create(
          `buff-${targetPlayer.id}-${Date.now()}-${Math.random()}`,
          targetPlayer.id,
          passiveEffect
        ),
      ],
    };
  },
  decrement_passive_turns: (state, playerKey, effect) => {
    const playerId = effect.value as string;
    const updatedPassiveEffects = state.passiveEffects
      .map((pe) => pe.update({type: 'on_turn_end', actingPlayerId: playerId}))
      .filter((pe): pe is PassiveInstance => pe !== null);

    return {...state, passiveEffects: updatedPassiveEffects};
  },
};
