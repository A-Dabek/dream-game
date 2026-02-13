# Item Module

This module defines the core data structures for items and player loadouts in the game.

## Key Components

- **ItemId**: A union type of unique string identifiers for all items in the game. Most items follow the
  `_blueprint_` prefix convention (e.g., `_blueprint_attack`, `_blueprint_reactive_removal`), except for utility items like `_dummy`.
- **Item**: An interface representing a single item, characterized by its `ItemId` and optional `genre` field.
- **Genre**: A type representing the item's category (currently only `'basic'`). Determines icon colors in the UI via CSS variables
  (e.g., `--genre-basic`). The genre system is designed to be extensible for future types like 'fire', 'poison', etc.
- **Effect**: An interface representing an atomic effect (e.g., damage, healing). Each effect has a `target` property (`self` or `enemy`) to explicitly define whom it affects.
- **Effect Creators**: Factory functions that simplify the creation of `Effect` and `StatusEffect` objects. Examples include
  `attack(amount, target?)`, `heal(amount, target?)`, `removeItem(value, target?)`, and `statusEffect(config)`.
- **Passive Effects**: Effects that are active while an item is in the loadout. Defined via `passiveEffects()` in `ItemBehavior`.
- **Status Effects**: Lingering effects that are applied when an item is played. Defined via `whenPlayed()` using `addStatusEffect()`.
- **Passive/Status Logic**: Both use the same underlying structure consisting of a `Condition` (e.g.,
  `beforeEffect('damage')`, `afterEffect('damage')`, `onPlay()`, `onTurnEnd()`), an action (Effect or list of Effects), and an optional `Duration`.
- **ItemBehavior**: An interface responsible for defining item logic, returning `Effect[]` from `whenPlayed()` and
  `PassiveEffect[]` from `passiveEffects()`.
- **Item Implementations**: Concrete classes located in the `library` directory following the `<item name>.behaviour.ts`
  convention that implement `ItemBehavior` for specific items (e.g., `BlueprintAttackBehaviour`,
  `BlueprintPassiveAttackBehaviour`, `TripleThreatBehaviour`).
- **Library**: The `library` directory contains all concrete item behaviors and a guide on how to add new ones.
- **Loadout**: An interface representing a player's set of items and base attributes like health and speed.
- **Game Balance Configuration**: `GAME_CONFIG` object in `game-config.ts` provides centralized baseline values for game balance:
  - `BASE_HEALTH`: Average player health baseline (20)
  - `BASE_ATTACK`: Baseline damage for attacks (5)
  - `HEAL_MODIFIER`: Multiplier for healing (1.2)
  - `BASE_HEAL`: Calculated as `Math.floor(BASE_ATTACK * HEAL_MODIFIER)` (6)
  - Changing `BASE_ATTACK` automatically updates `BASE_HEAL` for easy game balancing
- **Basic Items**: Three playable items using the configuration values:
  - `punch`: Deals `BASE_ATTACK` damage (icon: "punch")
  - `sticking_plaster`: Heals `BASE_HEAL` amount (icon: "sticking-plaster")
  - `hand`: No effect (pass turn) (icon: "hand")

  **Note**: The ItemId IS the icon name (with dashes replaced by underscores). The `iconNameFromItemId()` utility normalizes IDs by replacing underscores with dashes to match icon names in `assets/icons.json`.

## Responsibility

The `item` module serves as a base for other modules, providing the fundamental types used by the engine and the board.
It is designed to be independent and unaware of other modules.

For detailed instructions on how to add a new item, invoke the `add-new-item` skill via the skill tool.
