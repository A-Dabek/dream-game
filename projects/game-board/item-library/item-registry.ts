import { Genre, ItemId, ItemDefinition } from '../item';
import { ActiveEffectLibrary } from '../effect-library/active-effects';
import { StatusEffectLibrary } from '../effect-library/status-effects';
import {
  charges,
  permanent,
  turns,
  afterEffect,
  onTurnEnd,
  GAME_CONFIG,
  BASE_HEAL,
} from '../item';

export const ItemLibrary = {
  hand: (): ItemDefinition => ({
    genre: 'basic',
    onPlayEffects: [],
  }),

  punch: (): ItemDefinition => ({
    genre: 'basic',
    onPlayEffects: [ActiveEffectLibrary.attack(GAME_CONFIG.BASE_ATTACK)],
  }),

  sticking_plaster: (): ItemDefinition => ({
    genre: 'basic',
    onPlayEffects: [ActiveEffectLibrary.heal(BASE_HEAL)],
  }),

  sticky_boot: (): ItemDefinition => ({
    genre: 'basic',
    onPlayEffects: [
      ActiveEffectLibrary.modify_speed(
        -GAME_CONFIG.BASE_SPEED_MODIFIER,
        'enemy',
      ),
    ],
  }),

  wingfoot: (): ItemDefinition => ({
    genre: 'basic',
    onPlayEffects: [
      ActiveEffectLibrary.modify_speed(GAME_CONFIG.BASE_SPEED_MODIFIER, 'self'),
    ],
  }),

  gas_grenade: (): ItemDefinition => ({
    genre: 'poison',
    onPlayEffects: [
      ActiveEffectLibrary.add_status_effect(
        StatusEffectLibrary.poison(10),
        'self',
      ),
      ActiveEffectLibrary.add_status_effect(
        StatusEffectLibrary.poison(10),
        'enemy',
      ),
    ],
  }),

  _blueprint_attack: (): ItemDefinition => ({
    genre: 'basic',
    onPlayEffects: [ActiveEffectLibrary.attack(10)],
  }),

  _blueprint_heal_5: (): ItemDefinition => ({
    genre: 'basic',
    onPlayEffects: [ActiveEffectLibrary.heal(5)],
  }),

  _blueprint_passive_attack: (): ItemDefinition => ({
    genre: 'basic',
    onPlayEffects: [StatusEffectLibrary.passive_attack(5)],
  }),

  _blueprint_reactive_removal: (): ItemDefinition => ({
    genre: 'basic',
    onPlayEffects: [],
    passiveEffects: [
      StatusEffectLibrary.status_effect({
        type: 'reactive_removal',
        condition: afterEffect('damage'),
        action: [],
      }),
    ],
  }),

  _blueprint_self_damage: (): ItemDefinition => ({
    genre: 'basic',
    onPlayEffects: [ActiveEffectLibrary.attack(10, 'self')],
  }),

  _blueprint_damage_to_heal_charges: (): ItemDefinition => ({
    genre: 'basic',
    onPlayEffects: [
      ActiveEffectLibrary.add_status_effect(
        StatusEffectLibrary.invert('damage', charges(2)),
      ),
    ],
  }),

  _blueprint_damage_to_heal_permanent: (): ItemDefinition => ({
    genre: 'basic',
    onPlayEffects: [
      ActiveEffectLibrary.add_status_effect(
        StatusEffectLibrary.invert('damage', permanent()),
      ),
    ],
  }),

  _blueprint_damage_to_heal_turns: (): ItemDefinition => ({
    genre: 'basic',
    onPlayEffects: [
      ActiveEffectLibrary.add_status_effect(
        StatusEffectLibrary.invert('damage', turns(2)),
      ),
    ],
  }),

  _dummy: (): ItemDefinition => ({
    genre: 'basic',
    onPlayEffects: [],
  }),

  _blueprint_negate_damage: (): ItemDefinition => ({
    genre: 'basic',
    onPlayEffects: [
      ActiveEffectLibrary.add_status_effect(
        StatusEffectLibrary.negate('damage', charges(1)),
      ),
    ],
  }),

  _blueprint_triple_threat: (): ItemDefinition => ({
    genre: 'basic',
    onPlayEffects: [
      ActiveEffectLibrary.attack(2),
      ActiveEffectLibrary.add_status_effect(
        StatusEffectLibrary.status_effect({
          type: '_blueprint_triple_threat',
          condition: onTurnEnd(),
          action: [ActiveEffectLibrary.attack(3)],
          duration: { type: 'permanent' },
        }),
      ),
    ],
    passiveEffects: [
      StatusEffectLibrary.status_effect({
        type: '_blueprint_triple_threat',
        condition: onTurnEnd(),
        action: [ActiveEffectLibrary.attack(1)],
        duration: { type: 'permanent' },
      }),
    ],
  }),
} as const;

export function getItemBehavior(itemId: ItemId): ItemDefinition {
  const entry = ItemLibrary[itemId];
  if (!entry) {
    throw new Error(`No behavior found for item: ${itemId}`);
  }
  return entry();
}

export function getItemGenre(itemId: ItemId): Genre {
  return getItemBehavior(itemId).genre;
}
