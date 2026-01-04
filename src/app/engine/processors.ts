import {attack, ItemEffect, ItemId} from '../item';
import {EngineState} from './engine.model';

export type EffectProcessor = (
  state: EngineState,
  playerKey: 'playerOne' | 'playerTwo',
  value: number | string
) => EngineState | ItemEffect[];

export const PROCESSORS: Record<string, EffectProcessor> = {
  damage: (state, playerKey, value) => [
    { type: 'apply_damage', value },
    { type: 'check_reactive_removal', value },
  ],
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
  check_reactive_removal: (state, playerKey, value) => {
    const opponentKey = playerKey === 'playerOne' ? 'playerTwo' : 'playerOne';
    const opponent = state[opponentKey];

    return state.passiveEffects
      .filter(
        (pe) => pe.playerId === opponent.id && pe.effect.condition.type === 'on_damage_taken'
      )
      .flatMap((pe) => pe.effect.effects);
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

    const updatedPassiveEffects = state.passiveEffects.filter(
      (pe) => pe.instanceId !== itemToRemove.instanceId
    );

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

    const updatedPassiveEffects = state.passiveEffects.filter(
      (pe) => pe.instanceId !== itemToRemove.instanceId
    );

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
      endOfTurnEffects: [
        ...state[playerKey].endOfTurnEffects,
        { type: 'passive_attack', value },
      ],
    },
  }),
  passive_attack: (state, playerKey, value) => [attack(value as number)],
};
