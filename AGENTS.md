# Agent Instructions - Dream Project

This document provides essential information for AI agents operating in the Dream Project repository. Follow these guidelines to ensure consistency, quality, and compatibility with the project's architecture.

## 🛠 Commands

Assume you are using Git Bash for Windows. All commands should be run from the project root.

| Action               | Command                                                                                                               |
| :------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| **Build**            | `ng build`                                                                                                            |
| **Test All**         | `ng test --watch=false`                                                                                               |
| **Test Single File** | `ng test --include "<glob>" --watch=false` (e.g., `ng test --include "src/app/game/impl/game.spec.ts" --watch=false`) |
| **Lint / Format**    | `npm run format` (Prettier)                                                                                           |
| **Check Format**     | `npm run format:check`                                                                                                |
| **Verify All**       | `npm run verify` (Format + Build + Test)                                                                              |

---

## 🎨 Code Style Guidelines

### TypeScript Best Practices

- **Strict Typing**: Always use strict type checking. Avoid `any`; use `unknown` if the type is truly dynamic.
- **Type Inference**: Prefer type inference when the type is obvious (e.g., `const count = signal(0)`).
- **Immutability**: Use `readonly` for properties that should not be modified after initialization.
- **Visibility**: Do NOT use the `public` modifier; it is the default. Use `private` or `protected` where appropriate.
- **Module API**: Expose the public API of modules via `index.ts` files. Export members explicitly.

### Angular Best Practices

- **Standalone Components**: Always use standalone components. Do NOT set `standalone: true` in decorators (default in Angular v20+).
- **Dependency Injection**: Use the `inject()` function instead of constructor injection.
- **Change Detection**: Set `changeDetection: ChangeDetectionStrategy.OnPush` for all components.
- **Control Flow**: Use native control flow (`@if`, `@for`, `@switch`) instead of legacy directives (`*ngIf`, etc.).
- **Host Bindings**: Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator. Do NOT use `@HostBinding` or `@HostListener`.
- **Forms**: Prefer Reactive Forms over template-driven ones.

### Components & Templates

- **Small & Focused**: Keep components small with a single responsibility. Prefer inline templates for simple components (< 50 lines).
- **Signals-First**: Use `input()`, `output()`, and `model()` functions instead of decorators.
- **Derived State**: Use `computed()` for any state derived from other signals.
- **Bindings**: Use class/style bindings (e.g., `[class.active]="..."`) instead of `ngClass` or `ngStyle`.
- **Images**: Use `NgOptimizedImage` for static images (except base64).

### State Management

- **Local State**: Use signals for local component state.
- **Global/Shared State**: Use signals within services.
- **Transformations**: Keep state transformations pure. Use `update()` or `set()` on signals; do NOT use `mutate`.
- **Derived State**: Use `computed()` for any state derived from other signals. Avoid `effect()` unless for side effects (e.g., logging, manual DOM manipulation).

### Error Handling

- **Predictive Validation**: Validate actions (e.g., in `Board`) before attempting to process them in the Engine.
- **Graceful Failures**: Use `try/catch` sparingly in the UI; prefer reactive error states.
- **Engine Safety**: The Engine assumes valid inputs; orchestration layers (Board/Game) must ensure validity.

### Naming Conventions

- **Files**: Use `kebab-case` for all files (e.g., `game-container.component.ts`).
- **Classes/Types**: Use `PascalCase`.
- **Variables/Functions**: Use `camelCase`.
- **Constants**: Use `UPPER_SNAKE_CASE` for global constants.
- **Signals**: Do NOT use a suffix like `$` for signals.

---

## 🏗 Project Architecture

The project is divided into two main trees: `src/app/` (Logic) and `src/ui/` (Presentation).

### Core Modules (`src/app/`)

- **Item**: Defines items, effects, and the item library. No dependencies.
- **Engine**: A synchronous state machine using signals. Manages game state and turn order.
  - **Listeners**: Reactive components (LIFO) that can modify, consume, or expand events.
  - **Processors**: Pure functions that apply atomic effects (damage, heal, etc.) to the state.
- **Board**: Orchestration layer. Handles validation and simulation (cloning).
- **AI**: CPU strategies (Minimax, etc.) using `Board` simulation.
- **Game**: High-level orchestration, async game loop, and rating synchronization.

### UI Tree (`src/ui/`)

- **Styles**: Global SCSS in `src/ui/styles/styles.scss`. Components do NOT have individual CSS files.
- **Common**: Reusable components like icons and item displays.
- **Game**: Orchestrates screens (Pre-game, Game, Post-game) with slide transitions.

---

## 🧪 Testing Guidelines

- **Framework**: Using **Vitest** via Angular CLI.
- **Locality**: Place `.spec.ts` files next to the implementation.
- **Mocks**: Minimize mocking; prefer using real `Board` or `Engine` instances for integration-like tests.
- **Coverage**: Ensure complex reactive logic in the Engine has high test coverage.
- **Command**: `ng test --include "src/app/engine/**/*.spec.ts" --watch=false`

---

## 💅 Styling Guidelines

- **Global Styles**: All component styles are consolidated in `src/ui/styles/styles.scss`.
- **Selectors**: Style components using their element selectors (e.g., `app-board-ui`). Avoid `.class` selectors for component-level layout.
- **Theming**: Use CSS custom properties (variables) defined in `:root` for colors and tokens.
- **Mobile First**: Design for mobile layouts first (opponent top, player bottom).

---

## 📝 Documentation

- **How & Why**: Focus comments on _how_ and _why_ logic works, not _what_ it does.
- **Module AGENTS.md**: Each major directory contains its own `AGENTS.md`. Update these when modifying module responsibilities.
- **JSDoc**: Use sparingly for public APIs.

---

## ♿ Accessibility (A11y)

- **Standards**: Must follow WCAG AA minimums.
- **Checks**: Ensure all UI changes pass AXE accessibility audits.
- **Focus**: Manage focus explicitly during screen transitions (e.g., focusing the first button on a new screen).

---

## 🤖 Rule Integration

This project incorporates instructions from:

- `.github/copilot-instructions.md`
- `.junie/guidelines.md`

Always refer to the nearest `AGENTS.md` for specific module details.
