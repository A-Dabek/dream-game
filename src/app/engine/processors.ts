import {attack, Effect, ItemId, PassiveEffect} from '../item';
import {DefaultPassiveInstance, PassiveInstance} from './effects';
import {EngineState} from './engine.model';

export type EffectProcessor = (
  state: EngineState,
  playerKey: 'playerOne' | 'playerTwo',
  value: any
) => EngineState | Effect[];

export const PROCESSORS: Record<string, EffectProcessor> = {
  damage: (state, playerKey, value) => {
    return [{type: 'apply_damage', value}];
  },
  apply_damage: (state, playerKey, value) => {
    const opponentKey = playerKey === 'playerOne' ? 'playerTwo' : 'playerOne';
    return {
      ...state,
      [opponentKey]: {
        ...state[opponentKey],
        health: state[opponentKey].health - (value as number),
      },
    };
  },
  remove_item: (state, playerKey, value) => {
    const player = state[playerKey];
    const itemIndex = player.items.findIndex((item) => item.id === (value as ItemId));

    if (itemIndex === -1) {
      return state;
    }

    const itemToRemove = player.items[itemIndex];
    const updatedItems = [...player.items];
    updatedItems.splice(itemIndex, 1);

    const updatedPassiveEffects = state.passiveEffects.filter((pe) => pe.instanceId !== itemToRemove.instanceId);

    return {
      ...state,
      [playerKey]: {
        ...player,
        items: updatedItems,
      },
      passiveEffects: updatedPassiveEffects,
    };
  },
  remove_item_from_opponent: (state, playerKey, value) => {
    const opponentKey = playerKey === 'playerOne' ? 'playerTwo' : 'playerOne';
    const opponent = state[opponentKey];
    const itemIndex = opponent.items.findIndex((item) => item.id === (value as ItemId));

    if (itemIndex === -1) {
      return state;
    }

    const itemToRemove = opponent.items[itemIndex];
    const updatedItems = [...opponent.items];
    updatedItems.splice(itemIndex, 1);

    const updatedPassiveEffects = state.passiveEffects.filter((pe) => pe.instanceId !== itemToRemove.instanceId);

    return {
      ...state,
      [opponentKey]: {
        ...opponent,
        items: updatedItems,
      },
      passiveEffects: updatedPassiveEffects,
    };
  },
  healing: (state, playerKey, value) => ({
    ...state,
    [playerKey]: {
      ...state[playerKey],
      health: state[playerKey].health + (value as number),
    },
  }),
  add_passive_attack: (state, playerKey, value) => ({
    ...state,
    [playerKey]: {
      ...state[playerKey],
      endOfTurnEffects: [...state[playerKey].endOfTurnEffects, {type: 'passive_attack', value}],
    },
  }),
  passive_attack: (state, playerKey, value) => [attack(value as number)],
  add_passive_effect: (state, playerKey, value) => {
    const effect = value as PassiveEffect;
    const player = state[playerKey];
    return {
      ...state,
      passiveEffects: [
        ...state.passiveEffects,
        DefaultPassiveInstance.create(
          `buff-${player.id}-${Date.now()}-${Math.random()}`,
          player.id,
          effect
        ),
      ],
    };
  },
  decrement_passive_turns: (state, playerKey, value) => {
    const playerId = value as string;
    const updatedPassiveEffects = state.passiveEffects
      .map((pe) => pe.update({type: 'on_turn_end', actingPlayerId: playerId}))
      .filter((pe): pe is PassiveInstance => pe !== null);

    return {...state, passiveEffects: updatedPassiveEffects};
  },
};
