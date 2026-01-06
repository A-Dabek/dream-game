# Adding a New Item

Follow these steps to add a new item to the game.

## 1. Define the Item ID

Add the new item ID to the `ItemId` union type in `src/app/item/item.model.ts`.
Every item should follow the `_blueprint_` prefix convention.

```typescript
export type ItemId =
  | '_blueprint_attack'
  | '_blueprint_passive_attack'
  | '_blueprint_reactive_removal'
  | '_blueprint_new_item'; // Add yours here
```

## 2. Create the Item Behavior

Create a new file `src/app/item/_<item_id_without_prefix>.behaviour.ts`.
Implement the `ItemBehavior` interface.

```typescript
import {attack} from '..';
import {Effect, ItemBehavior} from '../item.model';

export class BlueprintNewItemBehaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [attack(10)];
  }

  // Optional: implement if the item has passive effects while in the loadout
  passiveEffects(): PassiveEffect[] {
    return [
      passive({
        condition: afterEffect('damage'),
        action: removeItem('_blueprint_new_item', 'enemy'),
      })
    ];
  }
}
```

### Effects

Items return a list of `Effect` objects from `whenPlayed()`, which are applied immediately.

Items can also return a list of `PassiveEffect` objects from `passiveEffects()`, which are reactive and active while the item is in the loadout.

### Lifecycle and Conditions

The engine processes effects through a defined lifecycle. Passives can react to various stages:

- `onPlay()`: Triggered when any item is played.
- `beforeEffect(type?)`: Triggered before an effect is applied. Use this to modify or negate effects.
- `afterEffect(type?)`: Triggered after an effect is successfully applied.
- `onTurnEnd()`: Triggered when a player's turn ends.

Example of a modifying passive:

```typescript
class ExampleItemBehaviour implements ItemBehavior {
  whenPlayed(): Effect[] {
    return [
      addPassiveEffect(
        invert('damage', charges(2))
      ),
    ];
  }
}
```

The `invert('damage', duration)` creator adds a passive effect that converts incoming damage into healing. `negate('damage', duration)` is another helper that consumes the effect entirely. Both are high-level wrappers that create specialized listeners in the engine.

### Persistent Passive Effects

Items can add passive effects that persist even after the item is removed from the loadout. Use `addPassiveEffect(passive({...}))` in `whenPlayed()`.

To define how long a passive effect lasts, use `turns(n)`, `charges(n)`, or `permanent()` within the `duration` property.

The engine scans for these effects at the start of the game and also manages them when they are added dynamically via `addPassiveEffect`.

## 3. Register the Behavior

Add the new behavior class to the `BEHAVIORS` registry in `src/app/item/item-registry.ts`.

```typescript
const BEHAVIORS: Record<ItemId, new () => ItemBehavior> = {
  // ...
  _blueprint_new_item: BlueprintNewItemBehaviour,
};
```

## 4. Export the Behavior

Export the new behavior class in `src/app/item/index.ts`.

```typescript
export {BlueprintNewItemBehaviour} from './_blueprint_new_item.behaviour';
```

## 5. Implement New Effects (If Needed)

If your item requires a new type of effect:

### A. Add Effect Creator

In `src/app/item/effects.ts` (or `conditions.ts` / `durations.ts`), add a factory function for the new effect.

```typescript
export function newEffect(value: number, target: 'self' | 'enemy' = 'self'): Effect {
  return {type: 'new_effect', value, target};
}
```

### B. Add Effect Processor

In `src/app/engine/processors.ts`, add a processor for the new effect in the `PROCESSORS` object.
Processors must return the updated state.

```typescript
export const PROCESSORS: Record<string, EffectProcessor> = {
  // ...
  new_effect: (state, playerKey, effect) => {
    // Return updated state
  },
};
```

### C. Document the Effect

Update `src/app/engine/AGENTS.md` to document the new effect and how it's processed.

## 6. Add Integration Tests

Create a new test file in `src/app/board/test/_<item_id_without_prefix>.spec.ts`.
Use `Board` class for integration testing. Use `createMockPlayer` from `test-utils.ts` to set up scenarios.

```typescript
import {describe, expect, it} from 'vitest';
import {Board} from '../board';
import {createMockPlayer} from './test-utils';

describe('_blueprint_new_item Integration Test', () => {
  it('should apply effects correctly', () => {
    const player1 = createMockPlayer('p1', {speed: 10, items: [{id: '_blueprint_new_item'}]});
    const player2 = createMockPlayer('p2', {speed: 1});
    const board = new Board(player1, player2);

    board.playItem('_blueprint_new_item', 'p1');

    // Add assertions
  });
});
```

## 7. Update Documentation

Update `src/app/item/AGENTS.md` and `src/app/AGENTS.md` to reflect the new item or any changes in the module's responsibilities.
