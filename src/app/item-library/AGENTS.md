# Item Library Module

This module contains all concrete item behavior implementations for the game.

## Structure

```
src/app/item-library/
  index.ts              # Public API exports
  item-registry.ts      # Behavior registry and getItemBehavior function
  AGENTS.md            # This file
  impl/                # Implementation directory
    index.ts           # Exports all behavior classes
    *.behaviour.ts     # Individual item behavior implementations
```

## Usage

Import behaviors and the registry function from the module:

```typescript
import { PunchBehaviour, getItemBehavior, BEHAVIORS } from '@dream/item-library';
import { ItemId } from '@dream/item';

// Get behavior instance for an item
const behavior = getItemBehavior('punch');
const effects = behavior.whenPlayed();

// Access behavior class directly
const behaviorClass = BEHAVIORS['punch'];
const instance = new behaviorClass();
```

## Adding New Items

When adding a new item:

1. Add the `ItemId` to `src/app/item/item.model.ts`
2. Create a new behavior class in `src/app/item-library/impl/<item_id>.behaviour.ts`
3. Export the class from `src/app/item-library/impl/index.ts`
4. Register the behavior in `src/app/item-library/item-registry.ts`
5. Import from `@dream/item` for types and effect creators

## Import Guidelines

**Always use path aliases:**

```typescript
// ✅ Correct
import { Item, Effect, attack } from '@dream/item';

// ❌ Incorrect - don't use relative imports
import { Item } from '../item';
```

## Available Behaviors

### Blueprint Behaviors (Test/Example Items)

- `BlueprintAttackBehaviour` - Basic 10 damage attack
- `BlueprintHeal5Behaviour` - Heal 5 HP
- `BlueprintPassiveAttackBehaviour` - Passive damage over time
- `BlueprintReactiveRemovalBehaviour` - Reacts to damage with removal
- `BlueprintSelfDamageBehaviour` - Self-damaging item
- `BlueprintDamageToHealChargesBehaviour` - Convert damage to healing (charges duration)
- `BlueprintDamageToHealTurnsBehaviour` - Convert damage to healing (turns duration)
- `BlueprintDamageToHealPermanentBehaviour` - Convert damage to healing (permanent)
- `BlueprintNegateDamageBehaviour` - Negate incoming damage
- `TripleThreatBehaviour` - Complex multi-effect item
- `DummyBehavior` - No-op item

### Basic Game Items

- `PunchBehaviour` - Deals `BASE_ATTACK` damage (uses game config)
- `StickingPlasterBehaviour` - Heals `BASE_HEAL` amount (uses game config)
- `HandBehaviour` - Pass turn (no effect)

## Dependencies

- `@dream/item` - Core types, effects, conditions, durations

This module has no dependencies on other app modules (engine, board, etc.)
