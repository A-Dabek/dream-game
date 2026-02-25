# Status Effects Display Component Specification

## Problem Description

The game currently has no visual representation of status effects applied to players. Players need to see which status effects are active on themselves and their opponent, including how many charges/turns remain for each effect.

The UI should display status effects in a vertical list format, positioned:
- **Above the health bar** for the human player
- **Below the health bar** for the enemy player

This positioning should be symmetrical around the health bars.

## Suggested Approach

### 1. Data Model Changes

The status effects data needs to be exposed from the engine to the UI. Currently, status effects are stored as `listeners` in the `EngineState`, but this is not exposed to the `GameState` used by the UI.

**New Interface: `StatusEffectDisplayData`**
```typescript
interface StatusEffectDisplayData {
  readonly instanceId: string;
  readonly type: StatusEffectType;
  readonly iconName: string;
  readonly remainingCharges: number | null;  // null for permanent/until_item_removed
  readonly durationType: 'turns' | 'charges' | 'permanent' | 'until_item_removed';
}
```

**Update `GameState`** to include:
```typescript
interface GameState {
  // ... existing fields
  playerStatusEffects: StatusEffectDisplayData[];
  opponentStatusEffects: StatusEffectDisplayData[];
}
```

**Update `BoardLoadout`** (optional, can be kept separate in GameState):
- No change needed - status effects are transient and not part of the loadout

### 2. New Component: `StatusEffectsComponent`

Create a new Angular component at `projects/game-board-ui/board/status-effects.component.ts`:

**Inputs:**
- `statusEffects: StatusEffectDisplayData[]` - List of status effects to display
- `playerId: string` - ID of the player (for styling)
- `side: 'player' | 'opponent'` - Which side the component is on (controls animation direction)

**Structure:**
- Vertical flex container with gap between items
- Each status effect is an icon from `StatusEffectDisplayRegistry`
- If `remainingCharges` is not null, show a circular badge with the number in the bottom-right corner of the icon
- Animation: slide from behind the health bar (player slides up from below, opponent slides down from above)

### 3. Styling

Create `projects/game-board-ui/styles/components/_status-effects.scss`:

- Similar structure to `_action-history.scss` and `_turn-queue.scss`
- Use faction-theme mixin for player/opponent styling
- **Animation for player side**:
  - Slide UP from behind the health bar (appear from below)
  - Slide DOWN to hide under the health bar
- **Animation for opponent side**:
  - Slide DOWN from behind the health bar (appear from above)
  - Slide UP to hide under the health bar
- Status effect icon size: similar to history-item (2.4rem)
- Charges badge: circular, positioned bottom-right of icon, with number inside

### 4. Integration

Add `StatusEffectsComponent` to `BoardUiComponent`:
- Place above `<app-health-bar variant="player">` in player-area
- Place below `<app-health-bar variant="opponent">` in opponent-area
- Pass the appropriate status effects data from GameState

### 5. UI State Service Update

Update `UiStateService.applyStateChangeLog()` to extract and map status effects from `EngineState.listeners` to `StatusEffectDisplayData` for both players.

## Acceptance Criteria

1. **Component Renders**: Status effects are displayed as vertical list of icons above/below health bars
2. **Icon Display**: Each status effect shows the correct icon from `StatusEffectDisplayRegistry` based on its type
3. **Charges Display**: If a status effect has remaining charges/turns, a circular badge with the number is shown in the bottom-right corner of the icon
4. **Animation Direction**:
   - Player status effects slide UP from behind (below) the health bar and slide DOWN to hide under it
   - Opponent status effects slide DOWN from behind (above) the health bar and slide UP to hide under it
5. **Symmetry**: The component is positioned symmetrically - above player's health bar and below opponent's health bar
6. **Visual Consistency**: The component matches the visual style of `TurnQueueComponent` and `ActionHistoryComponent`
7. **Data Flow**: Status effects are correctly propagated from engine listeners to the UI component through GameState
8. **Reactivity**: When status effects are added or removed, the UI updates accordingly with animations
