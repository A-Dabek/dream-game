---
name: angular-component-testing
description: Write Angular component tests using TestBed
---

# What you need

1. The component or feature to test.
2. What behaviors should be tested.

# What to do

## Location

Angular component tests are located in `projects/game-board-ui/` alongside the components they test, with `.spec.ts` extension.

## Conventions

- Use `TestBed` and `ComponentFixture` from `@angular/core/testing`
- Use `By` from `@angular/platform-browser` for DOM queries
- Use `data-testid` attributes for querying elements in templates
- Import the actual component and its dependencies
- Test observable behaviors, NOT implementation details

## Example Structure

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MyComponent } from './my.component';
import { IconComponent } from '@shared-ui';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent, IconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct data', () => {
    component.data = { name: 'Test' };
    fixture.detectChanges();
    
    const element = fixture.debugElement.query(By.css('[data-testid="name"]'));
    expect(element.nativeElement.textContent).toBe('Test');
  });
});
```

## Running Tests

Run Angular component tests with:
```bash
npm run test -- --projects=game-board-ui
```
