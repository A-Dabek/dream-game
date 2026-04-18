export interface RandomEffectDefinition {
  type: 'damage' | 'healing';
  value: number;
  target: 'self' | 'enemy';
}

export interface RandomItemDefinition {
  id: string;
  icon: string;
  onPlayEffects: RandomEffectDefinition[];
}
