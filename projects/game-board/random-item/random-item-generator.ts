import {
  RandomEffectDefinition,
  RandomItemDefinition,
} from './random-item-definition';

function generateNormalValue(
  mean: number,
  stdDev: number,
  min: number,
  max: number,
  random: () => number,
): number {
  let u = 0,
    v = 0;
  while (u === 0) u = random();
  while (v === 0) v = random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  const val = Math.round(z * stdDev + mean);
  return Math.min(max, Math.max(min, val));
}

export const RandomItemGenerator = {
  generate(
    count: number,
    random: () => number = Math.random,
  ): RandomItemDefinition[] {
    return Array.from({ length: count }, (_, i) =>
      this.generateOne(`rand_${i + 1}`, random),
    );
  },

  generateOne(
    id: string,
    random: () => number = Math.random,
  ): RandomItemDefinition {
    const effectCount = random() < 0.5 ? 1 : 2;
    const onPlayEffects: RandomEffectDefinition[] = Array.from(
      { length: effectCount },
      () => {
        const type = random() < 0.5 ? 'damage' : 'healing';
        const target = random() < 0.5 ? 'self' : 'enemy';

        let value: number;
        if (type === 'damage') {
          value = generateNormalValue(5, 2, 1, 9, random);
        } else {
          value = generateNormalValue(6, 2, 1, 10, random);
        }

        return { type, value, target };
      },
    );

    return { id, onPlayEffects };
  },
};
