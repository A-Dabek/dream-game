import { StatusEffect } from '../../../item';
import { Listener } from '../../engine.types';

export interface EffectInstance extends Listener {
  readonly effect: StatusEffect;
}
