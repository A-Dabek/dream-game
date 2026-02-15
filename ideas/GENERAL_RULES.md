# Item Ideas — General Rules

## Current Baseline
- Game: 1v1, each player has 5 items; stats differ slightly (health, speed).
- Turn order: based on speed; each turn you can play 1 item.
- Effect types:
  - Passive: stays in hand and does something.
  - Status: played once, applies for X turns / X times / permanent.
  - Active: one-time effect.
- Existing basic items:
  - Attack
  - Heal
  - Speed Up
  - Slow Down
  - Do Nothing (interaction / filler)

## Brainstorming Structure
For each theme, define:
- Core fantasy (what it feels like)
- 2–3 active items
- 2–3 status items (turns / charges / permanent)
- 1 passive item
- One interaction or "do nothing but matters" item
- Typical counterplay (what beats it)

## Core Mechanics (confirmed)
- Healing is capped at max health (no overheal).
- Turn order/initiative is known upfront; "consecutive turns" refers to back‑to‑back scheduled actions before the opponent acts.
- Start/end of turn sequencing is resolved by the engine based on play order when both would trigger in the same window.
- Hand order is tracked; references like "rightmost card" use the current visible hand order.
- Hands are revealed to both players (information is open by default).
- No global hand-size limit currently.
- Max‑health changes clamp current health to the new max immediately when modifiers apply or are removed.
- Effect texts that say "cannot kill" must leave the affected player at ≥ 1 HP (clamp instead of lethal resolution).
- Cleansing/blocks are specific:
  - Gas Mask blocks poison applications only.
  - Antidote removes poison stacks only and cannot undo immediate one‑shot effects like Bedrest’s instant skips.
