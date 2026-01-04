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
import {ItemBehavior, ItemEffect} from './item.model';
import {someEffect} from './item.effects';

export class BlueprintNewItemBehaviour implements ItemBehavior {
  whenPlayed(): ItemEffect[] {
    return [someEffect(10)];
  }

  // Optional: implement if the item should react to other effects
  onEffect(effect: ItemEffect): ItemEffect[] {
    if (effect.type === 'damage') {
      // React to damage
    }
    return [];
  }
}
```

### Reactive Items

If your item should react to being attacked (or other effects), implement the `onEffect` method.
The engine will call `onEffect` for all items in the victim's loadout when they are targeted by a `damage` effect (via `check_reactive_removal`).

Use `removeItemFromOpponent(itemId)` if the item should be removed from its owner's loadout when reacting (since the acting player is the attacker).

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

In `src/app/item/item.effects.ts`, add a factory function for the new effect.

```typescript
export function newEffect(value: number): ItemEffect {
  return {type: 'new_effect', value};
}
```

### B. Add Effect Processor

In `src/app/engine/processors.ts`, add a processor for the new effect in the `PROCESSORS` object.
Processors can either return a new state or a list of further effects to be processed.

```typescript
export const PROCESSORS: Record<string, EffectProcessor> = {
  // ...
  new_effect: (state, playerKey, value) => {
    // Return updated state or more effects
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
