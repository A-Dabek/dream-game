export type Genre = 'basic' | 'poison';

export type ItemId =
  | '_blueprint_attack'
  | '_blueprint_passive_attack'
  | '_blueprint_reactive_removal'
  | '_blueprint_damage_to_heal_charges'
  | '_blueprint_damage_to_heal_turns'
  | '_blueprint_damage_to_heal_permanent'
  | '_blueprint_self_damage'
  | '_blueprint_negate_damage'
  | '_blueprint_triple_threat'
  | '_dummy'
  | '_blueprint_heal_5'
  | 'punch'
  | 'sticking_plaster'
  | 'hand'
  | 'sticky_boot'
  | 'wingfoot'
  | 'gas_grenade';

export type StatusEffectType =
  | 'poison'
  | 'invert'
  | 'negate'
  | 'reactive_removal'
  | 'advance_turn'
  | 'fatigue'
  | 'periodic_attack'
  | ItemId; // Allow item IDs for custom passive effects

export type EffectValue = number | string | StatusEffect;

export interface Effect {
  readonly type: string;
  readonly value: EffectValue;
  readonly target?: 'self' | 'enemy';
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
  readonly extraParams?: Record<string, unknown>;
}

export type PassiveEffect = StatusEffect;

export type ItemDefinition = {
  readonly genre: Genre;
  readonly onPlayEffects: readonly Effect[];
  readonly passiveEffects?: readonly PassiveEffect[];
};

export interface Item {
  readonly id: ItemId;
  readonly instanceId?: string;
  readonly genre: Genre;
}

export interface Loadout {
  readonly items: Item[];
  health: number;
  readonly speed: number;
}
