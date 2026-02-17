import { StatusEffect } from '../../item';
import { Listener } from '../engine.model';

export interface EffectInstance extends Listener {
  readonly effect: StatusEffect;
}
