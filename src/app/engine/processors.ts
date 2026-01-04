import {attack, getItemBehavior, ItemEffect, ItemId} from '../item';
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
    const triggerEffect: ItemEffect = { type: 'damage', value: value as number };

    return opponent.items.flatMap((item) => {
      const behavior = getItemBehavior(item.id);
      return behavior.onEffect ? behavior.onEffect(triggerEffect) : [];
    });
  },
  remove_item: (state, playerKey, value) => {
    const player = state[playerKey];
    const itemIndex = player.items.findIndex((item) => item.id === (value as ItemId));

    if (itemIndex === -1) {
      return state;
    }

    const updatedItems = [...player.items];
    updatedItems.splice(itemIndex, 1);

    return {
      ...state,
      [playerKey]: {
        ...player,
        items: updatedItems,
      },
    };
  },
  remove_item_from_opponent: (state, playerKey, value) => {
    const opponentKey = playerKey === 'playerOne' ? 'playerTwo' : 'playerOne';
    const opponent = state[opponentKey];
    const itemIndex = opponent.items.findIndex((item) => item.id === (value as ItemId));

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
