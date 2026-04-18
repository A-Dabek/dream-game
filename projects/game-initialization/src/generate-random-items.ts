import * as fs from 'fs';
import * as path from 'path';
import { ActiveEffectLibrary } from '../../game-board/effect-library';
import type { ActiveRandomEffect } from '../../game-board/effect-library/active-effects';
import type { RandomItemDefinition } from '../../game-board';
import { ICON_NAMES } from '../../shared-basic/icon-name';

type EffectType = ActiveRandomEffect['type'];
type Target = ActiveRandomEffect['target'];

/**
 * Human-editable rarity scale for effect types by target.
 * 1 = most common, 2 = 2x rarer than 1, 3 = 4x rarer, 4 = 8x rarer, etc.
 * Adding new effects with higher numbers keeps them naturally rare.
 */
const EFFECT_WEIGHTS: Record<EffectType, Record<Target, number>> = {
  damage: { enemy: 1, self: 3 },
  healing: { enemy: 2, self: 2 },
  speed_up: { enemy: 3, self: 2 },
  slow_down: { enemy: 3, self: 3 },
};

// Rarity scale for number of effects per item (same logarithmic scale)
// 1 = most common, 2 = 2x rarer, 3 = 4x rarer, 4 = 8x rarer
const EFFECT_COUNT_RARITY = { 1: 1, 2: 2, 3: 3, 4: 4 };

// Value ranges for each effect type by target (mean, stdDev, min, max)
// These are independent of rarity - higher rarity effects can still have large values
const VALUE_RANGES: Record<
  EffectType,
  Record<Target, [number, number, number, number]>
> = {
  damage: { enemy: [5, 2, 1, 9], self: [5, 2, 1, 9] },
  healing: { enemy: [6, 2, 1, 10], self: [6, 2, 1, 10] },
  speed_up: { enemy: [3, 1, 1, 5], self: [3, 1, 1, 5] },
  slow_down: { enemy: [3, 1, 1, 5], self: [3, 1, 1, 5] },
};

/** Converts logarithmic rarity scale to linear probability: 1 = most common, 2 = 2x rarer, 3 = 4x rarer, etc */
function rarityToLinearWeight(rarity: number): number {
  return 1 / Math.pow(2, rarity - 1);
}

/** Flattens nested weights into [key, weight] pairs and normalizes to sum to 1 */
function flattenAndNormalizeWeights(
  weights: Record<EffectType, Record<Target, number>>,
): Array<[effectType: EffectType, target: Target, weight: number]> {
  const entries: Array<[EffectType, Target, number]> = [];
  for (const effectType of Object.keys(weights) as EffectType[]) {
    for (const target of Object.keys(weights[effectType]) as Target[]) {
      const linearWeight = rarityToLinearWeight(weights[effectType][target]);
      entries.push([effectType, target, linearWeight]);
    }
  }
  const total = entries.reduce((sum, e) => sum + e[2], 0);
  return entries.map(([et, t, w]) => [et, t, w / total]);
}

/** Selects effect type and target based on weights using weighted random */
function selectEffect(
  weights: Record<EffectType, Record<Target, number>>,
  random: () => number,
): [EffectType, Target] {
  const entries = flattenAndNormalizeWeights(weights);
  let cumulative = 0;
  const roll = random();

  for (const [effectType, target, weight] of entries) {
    cumulative += weight;
    if (roll < cumulative) {
      return [effectType, target];
    }
  }
  // Fallback to last entry due to floating point
  const last = entries[entries.length - 1];
  return [last[0], last[1]];
}

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

/** Selects effect count based on rarity scale */
function selectEffectCount(random: () => number): number {
  const entries = Object.entries(EFFECT_COUNT_RARITY).map(
    ([count, rarity]) =>
      [Number(count), rarityToLinearWeight(rarity)] as [number, number],
  );
  const total = entries.reduce((sum, e) => sum + e[1], 0);
  const normalized = entries.map(
    ([count, weight]) => [count, weight / total] as [number, number],
  );

  let cumulative = 0;
  const roll = random();
  for (const [count, weight] of normalized) {
    cumulative += weight;
    if (roll < cumulative) return count;
  }
  return normalized[normalized.length - 1][0];
}

function generateOne(
  id: string,
  random: () => number = Math.random,
): RandomItemDefinition {
  const effectCount = selectEffectCount(random);
  const onPlayEffects = Array.from({ length: effectCount }, () => {
    const [effectType, target] = selectEffect(EFFECT_WEIGHTS, random);
    const [mean, stdDev, min, max] = VALUE_RANGES[effectType][target];
    const value = generateNormalValue(mean, stdDev, min, max, random);

    // Use ActiveEffectLibrary factory functions for type safety
    if (effectType === 'damage') {
      return ActiveEffectLibrary.attack(value, target);
    } else if (effectType === 'healing') {
      return ActiveEffectLibrary.heal(value, target);
    } else if (effectType === 'speed_up') {
      return ActiveEffectLibrary.modify_speed(value, target);
    } else {
      // slow_down
      return ActiveEffectLibrary.modify_speed(-value, target);
    }
  });

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
