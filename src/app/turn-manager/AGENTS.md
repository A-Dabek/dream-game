# Turn Manager Module

## Overview

Central home for the Bresenham-style turn distribution logic. The module produces `TurnEntry` objects (player ID plus a stable turn ID) so the engine, board, and UI can share one authoritative queue for logic and animations.

## Files

- `impl/turn-manager.ts` - Calculates upcoming `TurnEntry`s, advances turns, refreshes when speeds change while keeping the active entry, and exposes accumulated error so the engine can resume sequences deterministically.
- `impl/turn-manager.spec.ts` - Tests equal/zero speeds, advancing, refresh/reset, and ID reuse when reordering.
- `turn-manager.model.ts` - Public interface and `TurnEntry` type.
- `index.ts` - Re-exports interface and implementation for `@dream/turn-manager` imports.

## Usage

- Engine hydrates a `TurnManager` with the current queue/error, delegates `advance_turn` and speed-change refresh to it, and stores the resulting `TurnEntry[]` in `EngineState.turnQueue`.
- Board and UI consume the same `TurnEntry[]` from engine state without regenerating IDs client side.

## Testing

- `impl/turn-manager.spec.ts` validates distribution, refreshing while keeping the active entry, and stable ID reuse when the order changes.
