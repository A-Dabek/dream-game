# Turn Manager Module

## Overview

Central location for the Bresenham-style turn distribution logic that the engine and UI both depend upon. The module exposes the deterministic `TurnManager` implementation plus the shared interface needed to keep the turn queue in sync across layers.

## Files

- `impl/turn-manager.ts` – Concrete `TurnManager` implementation that calculates the sequence of upcoming player IDs, supports refreshing speeds, advancing turns, and exposing the accumulated error used by the engine to resume the sequence.
- `impl/turn-manager.spec.ts` – Unit tests that validate the generator’s behavior for equal and zero speeds, advancing turns, refresh/reset semantics, and the exposed getter for bulk-prefetching.
- `turn-manager.model.ts` – Shared TypeScript surface (`TurnManagerInterface`) used by any consumer that needs to interact with the manager without knowing about the internal implementation file path.
- `index.ts` – Module entry point that re-exports the interface and implementation so other modules can import from `@dream/turn-manager`.

## Usage

- **Engine** instantiates `TurnManager` from this module to derive `turnQueue`, `turnError`, and other turn metadata stored in `EngineState`.
- **Board** and **UI** indirectly rely on the same exports when they need to refresh or advance turns without duplicating the distribution algorithm.

## Testing

- `turn-manager.spec.ts` in `impl/` ensures the deterministic sequence aligns with the expected Bresenham-like behavior, including edge cases for zero speed and first-player selection.
