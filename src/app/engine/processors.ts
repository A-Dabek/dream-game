import {attack, ItemEffect} from '../item';
import {EngineState} from './engine.model';

export type EffectProcessor = (
  state: EngineState,
  playerKey: 'playerOne' | 'playerTwo',
  value: number | string
) => EngineState | ItemEffect[];

export const PROCESSORS: Record<string, EffectProcessor> = {
  damage: (state, playerKey, value) => [
    { type: 'apply_damage', value },
    { type: 'check_reactive_removal', value: 0 },
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
  check_reactive_removal: (state, playerKey, _value) => {
    const opponentKey = playerKey === 'playerOne' ? 'playerTwo' : 'playerOne';
    const opponent = state[opponentKey];
    const itemIndex = opponent.items.findIndex((item) => item.id === '_blueprint_reactive_removal');

    if (itemIndex === -1) {
      return state;
    }

    const updatedItems = [...opponent.items];
    updatedItems.splice(itemIndex, 1);

    return {
      ...state,
      [opponentKey]: {
        ...opponent,
        items: updatedItems,
      },
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
