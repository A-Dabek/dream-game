# Item Module

This module defines the core data structures for items and player loadouts in the game.

## Key Components

* **ItemId**: A union type of unique string identifiers for all items in the game. All items currently follow the `_blueprint_` prefix convention (e.g., `_blueprint_attack`, `_blueprint_reactive_removal`).
* **Item**: An interface representing a single item, characterized by its `ItemId`.
* **ItemEffect**: An interface describing an effect an item can have (e.g., damage, healing, adding end-of-turn or reactive effects). `value` can be `number` or `string`.
* **Effect Creators**: Factory functions that simplify the creation of `ItemEffect` objects, such as `attack(amount)`, `heal(amount)`, and `passiveAttack(amount)`.
* **Passive Effects**: Items can define passive effects that are active while in the loadout. They consist of a `Condition` (e.g., `onDamageTaken()`) and one or more `ItemEffect`s.
* **ItemBehavior**: An interface responsible for defining item logic, such as `whenPlayed()` effects and `passiveEffects()`.
* **Item Implementations**: Concrete classes following the `<item name>.behaviour.ts` convention that implement `ItemBehavior` for specific items (e.g., `BlueprintAttackBehaviour`, `BlueprintPassiveAttackBehaviour`).
* **Loadout**: An interface representing a player's set of items and base attributes like health and speed.

## Responsibility

The `item` module serves as a base for other modules, providing the fundamental types used by the engine and the board.
It is designed to be independent and unaware of other modules.

For detailed instructions on how to add a new item, see [ADDING_NEW_ITEM.md](./ADDING_NEW_ITEM.md).
