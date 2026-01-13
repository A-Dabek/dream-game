# AI Module

## Responsibilities

- Provides decision-making capabilities for CPU players.
- Interacts with the `Board` module to evaluate game states and potential actions.
- Uses a cloning mechanism to simulate game scenarios without affecting the main game state.
- Implements various decision-making algorithms (e.g., Minimax).

## Architecture

- The module uses the `Strategy` interface to define decision-making algorithms. `Strategy#decide` is asynchronous to support human input and potentially long-running AI calculations.
- `FirstAvailableStrategy` is a basic AI implementation.
- Strategies accept a `Board` instance and use its `clone()` method to explore possible future states.
- The module is built on top of the `Board` module and is unaware of the `Engine` or `Item` modules directly, relying on the `Board`'s abstraction.

## Algorithms

### FirstAvailableStrategy (Current)

- This strategy follows a simple "leftmost item" approach:
  1. Clone the current board.
  2. Identify the current player and their available items.
  3. If items are available, return a `PLAY_ITEM` action for the first item in the list.
  4. If no items are available, return a "pass" action (represented as `PLAY_ITEM` without an item ID).
