# Item Module

This module defines the core data structures for items and player loadouts in the game.

## Key Components

* **ItemId**: A union type of unique string identifiers for all items in the game. All items currently follow the
  `_blueprint_` prefix convention (e.g., `_blueprint_attack`, `_blueprint_reactive_removal`).
* **Item**: An interface representing a single item, characterized by its `ItemId`.
* **Effect**: An interface representing an atomic effect (e.g., damage, healing).
* **ItemEffect**: A union type representing either an `ActiveEffect` (immediate) or a `PassiveEffect` (reactive).
* **Effect Creators**: Factory functions that simplify the creation of `Effect` and `ItemEffect` objects, such as
  `attack(amount)`, `selfDamage(amount)`, `heal(amount)`, `active(effect)`, and `passive(config)`.
* **Passive Effects**: Items can define passive effects that react to game events based on a `Condition` (e.g.,
  `beforeEffect('damage')`, `afterEffect('damage')`, `onPlay()`, `onTurnEnd()`), an action (Effect, list of Effects, or
  a modifier function), and an optional `Duration`.
* **ItemBehavior**: An interface responsible for defining item logic, returning `ItemEffect[]` from `whenPlayed()` and
  `PassiveEffect[]` from `passiveEffects()`.
* **Item Implementations**: Concrete classes located in the `library` directory following the `<item name>.behaviour.ts`
  convention that implement `ItemBehavior` for specific items (e.g., `BlueprintAttackBehaviour`,
  `BlueprintPassiveAttackBehaviour`).
* **Library**: The `library` directory contains all concrete item behaviors and a guide on how to add new ones.
* **Loadout**: An interface representing a player's set of items and base attributes like health and speed.

## Responsibility

The `item` module serves as a base for other modules, providing the fundamental types used by the engine and the board.
It is designed to be independent and unaware of other modules.

For detailed instructions on how to add a new item, see [ADDING_NEW_ITEM.md](library/ADDING_NEW_ITEM.md).
