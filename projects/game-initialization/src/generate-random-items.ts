import * as fs from 'fs';
import * as path from 'path';
import type {
  RandomEffectDefinition,
  RandomItemDefinition,
} from '../../game-board';
import { ICON_NAMES } from '../../shared-basic/icon-name';

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

function generateOne(
  id: string,
  random: () => number = Math.random,
): RandomItemDefinition {
  const effectCount = random() < 0.5 ? 1 : 2;
  const onPlayEffects: RandomEffectDefinition[] = Array.from(
    { length: effectCount },
    () => {
      const roll = random();
      const type =
        roll < 0.4
          ? 'damage'
          : roll < 0.8
            ? 'healing'
            : roll < 0.9
              ? 'speed_up'
              : 'slow_down';
      const target = random() < 0.5 ? 'self' : 'enemy';

      let value: number;
      if (type === 'damage') {
        value = generateNormalValue(5, 2, 1, 9, random);
      } else if (type === 'healing') {
        value = generateNormalValue(6, 2, 1, 10, random);
      } else {
        value = generateNormalValue(3, 1, 1, 5, random);
      }

      return { type, value, target };
    },
  );

  const iconIndex = Math.floor(random() * ICON_NAMES.length);
  const icon = ICON_NAMES[iconIndex];

  return { id, icon, onPlayEffects };
}

function seededRandom(seed: number) {
  let s = seed;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateItems(count: number, random: () => number = Math.random) {
  return Array.from({ length: count }, (_, i) =>
    generateOne(`rand_${i + 1}`, random),
  );
}

// Generate 100 random items using seeded random for reproducibility
const random = seededRandom(42);
const items = generateItems(100, random);

// Resolve the absolute path to assets folder from project root
const projectRoot = path.resolve(__dirname, '../../..');
const assetsPath = path.join(projectRoot, 'assets', 'random_items.json');

fs.writeFileSync(assetsPath, JSON.stringify(items, null, 2));
console.log('Generated 100 random items to assets/random_items.json');
