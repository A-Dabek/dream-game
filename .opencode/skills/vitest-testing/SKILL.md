---
name: vitest-testing
description: Write Vitest unit/integration tests for game logic
---

# What you need

1. The module or function to test.
2. What behaviors should be verified.

# What to do

## Location

Vitest tests are located in `projects/game-board/` alongside the modules they test, with `.spec.ts` extension. Integration tests for items are in `projects/game-board/board/test/`.

## Conventions

- Use Vitest with `describe`, `expect`, `it` from `vitest`
- Test observable behaviors, NOT implementation details
- Group tests using `describe` blocks by feature/component
- Use `createTestBoard` utility for board-based tests (see existing examples)
- Mock external dependencies where appropriate

## Example Structure

```typescript
import { describe, expect, it } from 'vitest';
import { MyModule } from './my-module';

describe('MyModule', () => {
  it('should do something', () => {
    const result = MyModule.doSomething();
    expect(result).toBe(expected);
  });
});
```

## Board Integration Tests

For testing items and game mechanics, use the `createTestBoard` utility:

```typescript
import { describe, expect, it } from 'vitest';
import { ItemId } from '../../item';
import { Board } from '../impl/board';
import { createMockPlayer } from './test-utils';

function createTestBoard(player1Items: ItemId[]): Board {
  const player1 = createMockPlayer('p1', { speed: 10, items: player1Items });
  const player2 = createMockPlayer('p2', { speed: 1 });
  return new Board(player1, player2);
}

describe('My Item Integration Test', () => {
  it('should have expected effect', () => {
    const board = createTestBoard(['my_item']);
    const initialOpponentHealth = board.opponentHealth;

    const result = board.playItem('my_item', 'p1');

    expect(result.success).toBe(true);
    expect(board.opponentHealth).toBeLessThan(initialOpponentHealth);
  });
});
```

## Running Tests

Run Vitest tests with:
```bash
npm run test -- --projects=game-board
```
