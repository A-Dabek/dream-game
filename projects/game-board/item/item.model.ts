export type Genre = 'basic' | 'poison' | 'doctor';

export type MergeStrategy = 'new' | 'increase';

export type StaticItemId =
  | '_blueprint_attack'
  | '_blueprint_passive_attack'
  | '_blueprint_reactive_removal'
  | '_blueprint_damage_to_heal_charges'
  | '_blueprint_damage_to_heal_turns'
  | '_blueprint_damage_to_heal_permanent'
  | '_blueprint_self_damage'
  | '_blueprint_negate_damage'
  | '_blueprint_passive_negate'
  | '_blueprint_damage_to_owner'
  | '_blueprint_heal_on_damage'
  | '_blueprint_triple_threat'
  | '_blueprint_anti_nullify'
  | '_dummy'
  | '_blueprint_heal_5'
  | 'punch'
  | 'sticking_plaster'
  | 'hand'
  | 'sticky_boot'
  | 'wingfoot'
  | 'gas_grenade'
  | 'antidote'
  | 'gas_mask'
  | 'poison_drink'
  | 'poison_darts'
  | 'stitches'
  | 'adrenaline'
  | 'drip';

export type ItemId = StaticItemId | string;

export type StaticStatusEffectType =
  | 'poison'
  | 'invert'
  | 'negate'
  | 'reactive_removal'
  | 'advance_turn'
  | 'impatience'
  | 'periodic_attack'
  | 'anti_nullify'
  | 'stitches'
  | 'heart_strain'
  | 'drip';

export type StatusEffectType = StaticStatusEffectType | string;

export type EffectValue = number | string | StatusEffect;

export interface Effect {
  type: string;
  value: EffectValue;
  target: 'self' | 'enemy';
}

export type ConditionValue = string | undefined;

export interface Condition {
  readonly type: string;
  readonly value?: ConditionValue;
  readonly subConditions?: Condition[];
}

export interface Duration {
  readonly type: 'turns' | 'charges' | 'permanent' | 'until_item_removed';
  readonly value?: number | string;
}

export interface StatusEffect {
  readonly type: StatusEffectType;
  readonly condition: Condition;
  readonly action: Effect[];
  readonly duration?: Duration;
  readonly genre: Genre;
  readonly extraParams?: Record<string, unknown>;
  readonly mergeStrategy: MergeStrategy;
}

export type PassiveEffect = StatusEffect;

export type ItemDefinition = {
  readonly genre: Genre;
  readonly onPlayEffects: Effect[];
  readonly passiveEffects?: PassiveEffect[];
  readonly usages?: number;
};

export interface Item {
  readonly id: ItemId;
  readonly instanceId?: string;
  readonly genre: Genre;
  readonly remainingUsages: number;
}

export interface Loadout {
  items: Item[];
  health: number;
  speed: number;
}

const STATIC_ITEM_IDS: Set<string> = new Set<string>([
  '_blueprint_attack',
  '_blueprint_passive_attack',
  '_blueprint_reactive_removal',
  '_blueprint_damage_to_heal_charges',
  '_blueprint_damage_to_heal_turns',
  '_blueprint_damage_to_heal_permanent',
  '_blueprint_self_damage',
  '_blueprint_negate_damage',
  '_blueprint_passive_negate',
  '_blueprint_damage_to_owner',
  '_blueprint_heal_on_damage',
  '_blueprint_triple_threat',
  '_blueprint_anti_nullify',
  '_dummy',
  '_blueprint_heal_5',
  'punch',
  'sticking_plaster',
  'hand',
  'sticky_boot',
  'wingfoot',
  'gas_grenade',
  'antidote',
  'gas_mask',
  'poison_drink',
  'poison_darts',
  'stitches',
  'adrenaline',
  'drip',
]);

export function isStaticItemId(id: string): id is StaticItemId {
  return STATIC_ITEM_IDS.has(id);
}
