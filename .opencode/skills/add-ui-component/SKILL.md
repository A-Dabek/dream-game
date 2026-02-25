---
name: add-ui-component
description: Use this skill when adding a new UI component to the game-board-ui project
---

# Skill: add-ui-component

## What you need

- Component name and purpose
- List of inputs/outputs needed
- Parent component where it will be used

## What to do

### 1. Create Component

**Where:** `projects/game-board-ui/board/{component-name}.component.ts`

Create a standalone component with:

```typescript
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-{component-name}',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <!-- Template content -->
  `,
})
export class {ComponentName}Component {
  // Signal inputs for data flow
  readonly data = input.required<DataType>();
  readonly optionalProp = input(defaultValue);
  
  // Computed signals for derived state (NO methods in templates)
  readonly computedValue = computed(() => {
    return this.data().someTransformation;
  });
  
  // Event outputs
  readonly actionTriggered = output<void>();
}
```

**Key Patterns:**
- Use `standalone: true` for all components
- Always use `ChangeDetectionStrategy.OnPush`
- Use signal inputs (`input()` and `input.required()`)
- Use `output()` for events (not `@Output`)
- Use `computed()` for any derived state - **never call methods directly in templates**
- Use `@let` for template variables (e.g., `@let s = state()`)
- Use `@if`, `@for`, `@switch` for control flow (not *ngIf, *ngFor)

### 2. Define Styles

**Where:** `projects/game-board-ui/styles/components/_{component-name}.scss`

```scss
@use '../mixins' as *;

/* {ComponentName}Component styles */
app-{component-name} {
  display: flex;
  // Component layout styles
  
  .component-class {
    background: var(--color-surface-1);
    border: 1px solid var(--color-border);
    // Element styles using CSS variables
  }
  
  &.modifier-class {
    // Modifier styles
  }
}

// Animation keyframes
@keyframes {animation-name} {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// Disable animations for users who prefer reduced motion
.disable-animations app-{component-name} {
  .animated-element {
    transition: none;
    animation: none;
  }
}
```

**CSS Guidelines:**
- Use only CSS custom properties from `_tokens.scss` (e.g., `--color-surface-1`, `--color-border`)
- Import mixins with `@use '../mixins' as *;`
- Use the `faction-theme` mixin for player/opponent variants
- Define component selector as the root (e.g., `app-turn-queue { ... }`)
- Place `@keyframes` at the bottom of the file
- Support `.disable-animations` class for reduced motion preference

### 3. Register Styles

**Where:** `projects/game-board-ui/styles/styles.scss`

Add the new component import:

```scss
/* Component styles */
@use './components/board-ui';
@use './components/game-container';
@use './components/{component-name}';  // Add here
```

### 4. Add to Parent

**Where:** Parent component template and imports

Add to parent component imports:

```typescript
import { {ComponentName}Component } from './{component-name}.component';

@Component({
  imports: [
    // ... other imports
    {ComponentName}Component,
  ],
  template: `
    <app-{component-name}
      [data]="data()"
      [optionalProp]="value"
      (actionTriggered)="handleAction()"
    />
  `,
})
```

### 5. Create Tests

**Where:** `projects/game-board-ui/board/{component-name}.component.spec.ts`

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { {ComponentName}Component } from './{component-name}.component';

describe('{ComponentName}Component', () => {
  let component: {ComponentName}Component;
  let fixture: ComponentFixture<{ComponentName}Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [{ComponentName}Component],
    }).compileComponents();

    fixture = TestBed.createComponent({ComponentName}Component);
    component = fixture.componentInstance;
  });

  function setInputs(data: DataType) {
    fixture.componentRef.setInput('data', data);
    fixture.detectChanges();
  }

  describe('rendering', () => {
    it('should create', () => {
      setInputs(mockData);
      expect(component).toBeTruthy();
    });

    it('should render with data', () => {
      setInputs(mockData);
      const element = fixture.debugElement.query(By.css('.component-class'));
      expect(element).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should emit event on action', () => {
      setInputs(mockData);
      jest.spyOn(component.actionTriggered, 'emit');
      
      const trigger = fixture.debugElement.query(By.css('.trigger-class'));
      trigger.triggerEventHandler('click', null);
      
      expect(component.actionTriggered.emit).toHaveBeenCalled();
    });
  });

  describe('reactivity', () => {
    it('should update when inputs change', () => {
      setInputs(mockData);
      // Test initial state
      
      setInputs(updatedData);
      // Test updated state
    });
  });
});
```

## Animation Guidelines

Use Angular v21 native CSS animations with `animate.enter` and `animate.leave`. Do NOT use the Angular animations package (`@angular/animations`).

For detailed animation patterns, CSS transitions, keyframe examples, and best practices, use the Angular CLI MCP tools:

- **`angular-cli_get_best_practices`** - For general animation best practices
- **`angular-cli_search_documentation`** - To search the official Angular docs for specific animation APIs
- **`angular-cli_find_examples`** - To find code examples for modern Angular animation patterns

For simple enter/leave animations, use CSS keyframes combined with Angular's `animate.enter` and `animate.leave` directives in templates. Support reduced motion by disabling animations when `.disable-animations` class is present on the root element.

## Common CSS Variables

Available in `_tokens.scss`:

**Surfaces:**
- `--color-surface-1` - Cards/tiles
- `--color-surface-2` - Rails/panels
- `--color-surface-3` - Inner tracks

**Borders:**
- `--color-border` - Standard borders
- `--color-border-weak` - Subtle borders
- `--color-border-strong` - Prominent borders

**Text:**
- `--color-text` - Primary text
- `--color-text-muted` - Secondary text
- `--color-text-subtle` - Tertiary text

**Faction Colors:**
- `--color-player` / `--color-player-surface`
- `--color-opponent` / `--color-opponent-surface`

**Shadows:**
- `--shadow-soft`
- `--shadow-medium`
- `--shadow-text-strong`

**Layout:**
- `--hand-item-size`
- `--turn-queue-gap`
- `--health-bar-height`

## Reference: Existing Components

Study these for patterns:
- `turn-queue.component.ts` - List rendering with skip button
- `health-bar.component.ts` - Simple display with computed value
- `player-hand.component.ts` - List with click handlers
- `action-history.component.ts` - List with icon mapping
- `status-effects.component.ts` - Uses legacy @angular/animations (deprecated)

## Anti-Patterns to Avoid

❌ **Do NOT:**
- Use `@angular/animations` package (deprecated in v21)
- Call methods in templates: `{{ getValue() }}` or `[class]="getClasses()"`
- Use inline styles in components
- Use `*ngIf`, `*ngFor`, `*ngSwitch` (use `@if`, `@for`, `@switch` instead)
- Use `@Input()` or `@Output()` (use `input()` and `output()` instead)
- Import styles directly in component `styleUrls`

✅ **DO:**
- Use `animate.enter` and `animate.leave` for DOM enter/leave animations
- Use `computed()` for derived state
- Use CSS custom properties for theming
- Keep styles in `projects/game-board-ui/styles/components/`
- Use `ChangeDetectionStrategy.OnPush` on all components
- Add `data-testid` attributes for testing
