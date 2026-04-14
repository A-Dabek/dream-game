import { Genre, ItemId, ItemDefinition } from '../item';
import { ActiveEffectLibrary } from '../effect-library/active-effects';
import { StatusEffectLibrary } from '../effect-library/status-effects';
import { ConditionLibrary } from '../item/conditions';
import { charges, permanent, turns, GAME_CONFIG, BASE_HEAL } from '../item';
import { DoctorItemLibrary } from './doctor-items';

const PoisonItemLibrary = {
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

  antidote: (): ItemDefinition => ({
    genre: 'poison',
    onPlayEffects: [{ type: 'antidote', value: '', target: 'self' }],
  }),

  gas_mask: (): ItemDefinition => ({
    genre: 'poison',
    onPlayEffects: [
      ActiveEffectLibrary.add_status_effect(
        StatusEffectLibrary.gas_mask(3),
        'self',
      ),
    ],
  }),

  poison_drink: (): ItemDefinition => ({
    genre: 'poison',
    onPlayEffects: [
      ActiveEffectLibrary.add_status_effect(
        StatusEffectLibrary.poison(20),
        'self',
      ),
    ],
  }),

  poison_darts: (): ItemDefinition => ({
    genre: 'poison',
    usages: 3,
    onPlayEffects: [
      ActiveEffectLibrary.attack(2),
      ActiveEffectLibrary.add_status_effect(
        StatusEffectLibrary.poison(2),
        'enemy',
      ),
    ],
  }),
} as const;

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

  ...PoisonItemLibrary,

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
    passiveEffects: [StatusEffectLibrary.reactive_removal('damage')],
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
  _blueprint_passive_negate: (): ItemDefinition => ({
    genre: 'basic',
    onPlayEffects: [],
    passiveEffects: [StatusEffectLibrary.negate('damage', permanent())],
  }),

  _blueprint_damage_to_owner: (): ItemDefinition => ({
    genre: 'basic',
    onPlayEffects: [],
    passiveEffects: [
      {
        type: '_blueprint_damage_to_owner',
        condition: ConditionLibrary.afterEffect('damage'),
        action: [],
        genre: 'basic',
        mergeStrategy: 'new',
      },
    ],
  }),

  _blueprint_heal_on_damage: (): ItemDefinition => ({
    genre: 'basic',
    onPlayEffects: [],
    passiveEffects: [
      {
        type: '_blueprint_heal_on_damage',
        condition: ConditionLibrary.afterEffect('damage'),
        action: [],
        genre: 'basic',
        mergeStrategy: 'new',
      },
    ],
  }),

  _blueprint_triple_threat: (): ItemDefinition => ({
    genre: 'basic',
    onPlayEffects: [
      ActiveEffectLibrary.attack(2),
      ActiveEffectLibrary.add_status_effect(
        StatusEffectLibrary.triple_threat(3),
      ),
    ],
    passiveEffects: [StatusEffectLibrary.triple_threat(1)],
  }),
  _blueprint_anti_nullify: (): ItemDefinition => ({
    genre: 'basic',
    onPlayEffects: [],
    passiveEffects: [StatusEffectLibrary.anti_nullify()],
  }),

  ...DoctorItemLibrary,
} as const;

type ItemFactory = () => ItemDefinition;

const dynamicItemRegistry = new Map<string, ItemFactory>();

export function registerItem(id: string, factory: ItemFactory): void {
  if (
    ItemLibrary[id as keyof typeof ItemLibrary] &&
    !dynamicItemRegistry.has(id)
  ) {
    console.warn(
      `Item "${id}" already exists in static ItemLibrary; dynamic registration skipped.`,
    );
    return;
  }
  dynamicItemRegistry.set(id, factory);
}

export function unregisterItem(id: string): void {
  dynamicItemRegistry.delete(id);
}

export function isRegisteredItemId(id: string): boolean {
  return !!(
    ItemLibrary[id as keyof typeof ItemLibrary] || dynamicItemRegistry.has(id)
  );
}

const EMPTY_ITEM_DEFINITION: ItemDefinition = {
  genre: 'basic',
  onPlayEffects: [],
};

export function getItemBehavior(itemId: ItemId): ItemDefinition {
  const staticEntry = ItemLibrary[itemId as keyof typeof ItemLibrary];
  if (staticEntry) {
    return staticEntry();
  }

  const dynamicEntry = dynamicItemRegistry.get(itemId);
  if (dynamicEntry) {
    return dynamicEntry();
  }

  return EMPTY_ITEM_DEFINITION;
}

export function getAllItemIds(): string[] {
  const staticIds = Object.keys(ItemLibrary);
  const dynamicIds = Array.from(dynamicItemRegistry.keys());
  return [...staticIds, ...dynamicIds];
}

export function getItemGenre(itemId: ItemId): Genre {
  try {
    return getItemBehavior(itemId).genre;
  } catch {
    return 'basic';
  }
}
