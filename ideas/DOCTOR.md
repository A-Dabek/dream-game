# Theme: Doctor (Draft)

Core fantasy: medical procedures, precision, risk/reward (organ exchange), recovery, and max‑health manipulation.

Main note:

- This theme experiments with Max HP changes and conditional overhealing mechanics (future exploration), while keeping base healing capped by default.

Cards:

1. Stitches (active — reworked)
   - Heal to full; add Stitches status equal to missing health healed.
   - While active: when taking damage D, remove 2·D stitches. When stitches reach 0, take stitched damage equal to the original heal (once).
2. Drip (status, charges)
   - Start of owner turn: heal a flat amount (values TBD). Order vs other start-of-turn effects depends on play order.
3. Triage (active)
   - Contextual basic effect from the Basic theme: if you’re more damaged than the enemy → Basic Heal; else if you’re less damaged → Basic Attack; else if enemy is faster → Basic Slow Down; else if enemy is slower → Basic Speed Up.
4. Transfusion (active)
   - Move half the HP difference (floor) from higher-HP to lower-HP. Cannot kill (donor stays ≥ 1 HP). No statuses moved/applied.
5. Transplant (active)
   - Hands are revealed. Take opponent’s rightmost card; if their hand is empty, do nothing. Treat as move/copy (no limit now).
6. Bedrest (active)
   - Immediately skip your upcoming known turns; heal a flat amount per skipped turn (TBD). Note: if speed changes, only already-known turns are affected.
7. Prosthetic (status-like passive)
   - While applied: flat −Max HP, +Speed (TBD). When removed, modifiers revert; current HP clamps to new max. Does not affect damage.
8. Defibrilate (active)
   - Set your Max HP to half of your original Max HP (floor/rounding TBD), fully heal to the new max, and apply Adrenaline status: immediate Speed Up; after 3 of your turns, apply a Slow Down.
9. Adrenaline Injection (active)
   - Apply Adrenaline status (Speed Up now; after 3 of your turns, Slow Down).
10. Organ Gamble (active)

- Lose flat Max HP for the rest of the duel; immediately heal a larger flat amount now (capped by current max). Risk‑reward swing.

11. Painkillers (status, 5 charges)

- For the next 5 damage instances you take, reduce each by 2. When Painkillers wear off, reduce your Max HP by 5.

12. Quarantine (status, 3 turns)

- For 3 turns, no one can gain new statuses (existing statuses continue to function).

13. Fight or flight - when health drops below 5% add permanent adrenaline status.

Legendary: 7. Young Doctor (build-around / passive)

- Tracks only your items. Immediately after you’ve played 3 items, specialization is determined implicitly by later usage (no extra UI).

8. Surgeon (legendary specialization / permanent status)
   - Flat increase to all damage. Only one Surgeon; playing again replaces. Adds procedure cards to hand immediately (details TBD).

Cross-theme notes:

- Drip vs Poison timing depends on which effect was played first.
- Gas Mask only blocks poison.
- Antidote cannot remove Bedrest (Bedrest resolves immediately).
