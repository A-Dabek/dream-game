import * as fs from 'fs';
import { RandomItemGenerator } from './random-item-generator';

function seededRandom(seed: number) {
  let s = seed;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// FIXME how is this seeded random? Why do we even need this instead of Math.random?
// FIXME this whole directory should probably be another project, or connected to enemy initialization (game-init)
const random = seededRandom(42);
const items = RandomItemGenerator.generate(100, random);
fs.writeFileSync('assets/random_items.json', JSON.stringify(items, null, 2));
console.log('Generated 100 random items to assets/random_items.json');
