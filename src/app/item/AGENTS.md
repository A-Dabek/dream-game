# Item Module

This module defines the core data structures for items and player loadouts in the game.

## Key Components

* **ItemId**: A union type of unique string identifiers for all items in the game (e.g., 'sword', 'shield', 'potion').
* **Item**: An interface representing a single item, characterized by its `ItemId`.
* **ItemEffect**: An interface describing an effect an item can have (e.g., damage, healing).
* **Effect Creators**: Factory functions that simplify the creation of `ItemEffect` objects, such as `attack(amount)`, `heal(amount)`, and `damageMultiplier(amount)`.
* **ItemBehavior**: An interface (alternative to ItemHandler) responsible for defining item logic, such as `whenPlayed()` effects.
* **Item Implementations**: Concrete classes following the `<item name>.behaviour.ts` convention that implement `ItemBehavior` for specific items (e.g., `SwordBehaviour`).
* **Loadout**: An interface representing a player's set of items and base attributes like health and speed.

## Responsibility

The `item` module serves as a base for other modules, providing the fundamental types used by the engine and the board.
It is designed to be independent and unaware of other modules.
