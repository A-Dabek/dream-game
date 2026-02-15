# Game UI Module

Screen-level components and the main game container orchestration.

## Components

- **GameContainerComponent**: Controls pre/game/post stages, starts games, and wires `UiStateService` into the board.
- **PreGameScreenComponent**: Minimal VS screen with a Ready action and hand reveal animation.
- **PostGameScreenComponent**: Winner/loser screen with replay action.

## Services

- **UrlGameConfigService**: Parses game configuration from URL query parameters for reproducible game states. Reads directly from `window.location.search` (not using `ActivatedRoute` due to timing issues with initial navigation).

## URL-Based Game State Initialization

The game supports initialization via URL query parameters for predictable, reproducible game states. This is useful for E2E testing and visual regression testing.

### Implementation Details

The `UrlGameConfigService` reads the URL query parameter directly from `window.location.search` rather than using Angular's `ActivatedRoute`. This approach ensures the state parameter is available immediately during component initialization, avoiding timing issues with route resolution.

The service parses the format: `items|health|speed;items|health|speed` where semicolons separate players and pipes separate fields.

### URL Format

```
?state=<player1_items>|<player1_health>|<player1_speed>;<player2_items>|<player2_health>|<player2_speed>
```

Where:

- `player_items`: comma-separated ItemId values
- `player_health`: numeric health value
- `player_speed`: numeric speed value
- Players separated by semicolon (`;`)
- Fields separated by pipe (`|`)

### Example

```
?state=punch,sticking_plaster|20|10;wingfoot|15|8
```

This creates:

- **Player 1**: Items `punch` and `sticking_plaster`, health 20, speed 10
- **Player 2**: Item `wingfoot`, health 15, speed 8

### Fallback Behavior

- If no `state` parameter is present, the game uses default values
- If the state parameter is malformed, the game gracefully falls back to defaults
- Invalid ItemIds are filtered out by the backbone
- Invalid numeric values (non-positive) fall back to defaults

### Usage in E2E Tests

```typescript
// Navigate with specific state for predictable testing
await page.goto('/?state=punch,sticking_plaster|20|10;wingfoot|15|8');
```

## Notes

- `GameContainerComponent` swaps screens with slide transitions and advances stage based on UI state.
- The game container uses `UrlGameConfigService` to parse URL parameters during initialization and creates players via `createGamePlayers()` from the backbone.
- When URL config is present, it overrides the default player configurations.

### How GameContainerComponent Uses UrlGameConfigService

1. **Injection**: `GameContainerComponent` injects `UrlGameConfigService` as a dependency.
2. **Configuration Retrieval**: On initialization, the component calls the service to parse the URL state parameter.
3. **Player Creation**: The parsed configuration is passed to `createGamePlayers()` to create player instances with the specified items, health, and speed.
4. **Fallback**: If no `state` parameter exists or parsing fails, the service returns `null` and the component falls back to default player configurations.

```typescript
// Pseudo-code of the integration
private urlConfig = inject(UrlGameConfigService);

// On init
const config = this.urlConfig.parseUrlState(); // Reads window.location.search
const players = config
  ? createGamePlayers(config)
  : createGamePlayers(); // Uses defaults
```
