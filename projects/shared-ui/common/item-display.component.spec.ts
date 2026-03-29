import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ItemDisplayComponent } from './item-display.component';
import { IconComponent } from '@shared-ui';
import { ItemConventionRegistry } from '@dream/game-board-ui';
import { Item } from '@dream/game-board';

describe('ItemDisplayComponent', () => {
  let component: ItemDisplayComponent;
  let fixture: ComponentFixture<ItemDisplayComponent>;

  const mockItem: Item = {
    id: 'punch',
    genre: 'basic',
    remainingUsages: 1,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemDisplayComponent, IconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDisplayComponent);
    component = fixture.componentInstance;
  });

  function setInputs(item: Item, active = false) {
    fixture.componentRef.setInput('item', item);
    fixture.componentRef.setInput('active', active);
    fixture.detectChanges();
  }

  describe('rendering', () => {
    it('should create', () => {
      setInputs(mockItem);
      expect(component).toBeTruthy();
    });

    it('should render icon', () => {
      setInputs(mockItem);
      const icon = fixture.debugElement.query(By.css('app-icon'));
      expect(icon).toBeTruthy();
    });

    it('should render label', () => {
      setInputs(mockItem);
      const label = fixture.debugElement.query(By.css('.label'));
      expect(label.nativeElement.textContent.trim()).toBe('punch');
    });
  });

  describe('pathD', () => {
    it('should compute pathD from ItemConventionRegistry', () => {
      setInputs(mockItem);
      const expectedPathD =
        ItemConventionRegistry.getItemDisplay('punch').pathD;
      const icon = fixture.debugElement.query(By.css('app-icon'));
      expect(icon.componentInstance.pathD()).toBe(expectedPathD);
    });

    it('should return empty string for unknown item id', () => {
      setInputs({
        id: 'unknown_item' as any,
        genre: 'basic',
        remainingUsages: 1,
      });
      const icon = fixture.debugElement.query(By.css('app-icon'));
      expect(icon.componentInstance.pathD()).toBe('');
    });
  });

  describe('color', () => {
    it('should use genre-based color when genre is present', () => {
      setInputs({ id: 'punch', genre: 'poison', remainingUsages: 1 });
      const icon = fixture.debugElement.query(By.css('app-icon'));
      expect(icon.componentInstance.color()).toBe('var(--genre-poison)');
    });

    it('should use currentColor when genre is not present', () => {
      setInputs({ id: 'punch', genre: undefined as any, remainingUsages: 1 });
      const icon = fixture.debugElement.query(By.css('app-icon'));
      expect(icon.componentInstance.color()).toBe('currentColor');
    });
  });

  describe('label', () => {
    it('should format item id as label', () => {
      setInputs(mockItem);
      const label = fixture.debugElement.query(By.css('.label'));
      expect(label.nativeElement.textContent.trim()).toBe('punch');
    });

    it('should remove blueprint prefix', () => {
      setInputs({
        id: '_blueprint_attack',
        genre: 'basic',
        remainingUsages: 1,
      });
      const label = fixture.debugElement.query(By.css('.label'));
      expect(label.nativeElement.textContent.trim()).toBe('blueprint attack');
    });

    it('should replace underscores with spaces', () => {
      setInputs({ id: 'sticky_boot', genre: 'basic', remainingUsages: 1 });
      const label = fixture.debugElement.query(By.css('.label'));
      expect(label.nativeElement.textContent.trim()).toBe('sticky boot');
    });
  });

  describe('active state', () => {
    it('should not add active class when active is false', () => {
      setInputs(mockItem, false);
      expect(
        fixture.elementRef.nativeElement.classList.contains('active'),
      ).toBe(false);
    });

    it('should add active class when active is true', () => {
      setInputs(mockItem, true);
      expect(
        fixture.elementRef.nativeElement.classList.contains('active'),
      ).toBe(true);
    });
  });

  describe('reactivity', () => {
    it('should update when item changes', () => {
      setInputs(mockItem);
      let label = fixture.debugElement.query(By.css('.label'));
      expect(label.nativeElement.textContent.trim()).toBe('punch');

      setInputs({ id: 'hand', genre: 'basic', remainingUsages: 1 });
      label = fixture.debugElement.query(By.css('.label'));
      expect(label.nativeElement.textContent.trim()).toBe('hand');
    });
  });
});
