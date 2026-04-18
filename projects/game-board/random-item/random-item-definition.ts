export interface RandomEffectDefinition {
  type: 'damage' | 'healing' | 'speed_up' | 'slow_down';
  value: number;
  target: 'self' | 'enemy';
}

export interface RandomItemDefinition {
  id: string;
  icon: string;
  onPlayEffects: RandomEffectDefinition[];
}
