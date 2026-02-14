import { StatusEffect } from '@dream/item';
import { Listener } from '../engine.model';

export interface EffectInstance extends Listener {
  readonly effect: StatusEffect;
}
