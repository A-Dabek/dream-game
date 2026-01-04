import {attack, ItemEffect} from '../item';
import {EngineState} from './engine.model';

export type EffectProcessor = (
  state: EngineState,
  playerKey: 'playerOne' | 'playerTwo',
  value: number
) => EngineState | ItemEffect[];

export const PROCESSORS: Record<string, EffectProcessor> = {
  damage: (state, playerKey, value) => {
    const opponentKey = playerKey === 'playerOne' ? 'playerTwo' : 'playerOne';
    const multiplier = state[playerKey].damageMultiplier || 1;
    const finalDamage = value * multiplier;
    return {
      ...state,
      [opponentKey]: {
        ...state[opponentKey],
        health: state[opponentKey].health - finalDamage,
      },
    };
  },
  healing: (state, playerKey, value) => ({
    ...state,
    [playerKey]: {
      ...state[playerKey],
      health: state[playerKey].health + value,
    },
  }),
  damageMultiplier: (state, playerKey, value) => ({
    ...state,
    [playerKey]: {
      ...state[playerKey],
      damageMultiplier: state[playerKey].damageMultiplier * value,
    },
  }),
  add_passive_attack: (state, playerKey, value) => ({
    ...state,
    [playerKey]: {
      ...state[playerKey],
      endOfTurnEffects: [...state[playerKey].endOfTurnEffects, { type: 'passive_attack', value }],
    },
  }),
  passive_attack: (state, playerKey, value) => [attack(value)],
};
