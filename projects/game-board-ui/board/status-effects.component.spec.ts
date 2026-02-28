import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { StatusEffectDisplayData } from '@dream/game-board';
import { StatusEffectsComponent } from './status-effects.component';
import { IconComponent } from '../common/icon.component';
import { ItemConventionRegistry } from '../conventions/convention-registry';

describe('StatusEffectsComponent', () => {
  let component: StatusEffectsComponent;
  let fixture: ComponentFixture<StatusEffectsComponent>;

  const mockStatusEffects: StatusEffectDisplayData[] = [
    {
      instanceId: 'effect-1',
      type: 'poison',
      remainingCharges: 3,
      durationType: 'turns',
    },
    {
      instanceId: 'effect-2',
      type: 'negate',
      remainingCharges: null,
      durationType: 'permanent',
    },
    {
      instanceId: 'effect-3',
      type: 'invert',
      remainingCharges: 2,
      durationType: 'charges',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusEffectsComponent, IconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusEffectsComponent);
    component = fixture.componentInstance;
  });

  function setInputs(
    effects: StatusEffectDisplayData[],
    side: 'player' | 'opponent' = 'player',
  ) {
    fixture.componentRef.setInput('statusEffects', effects);
    fixture.componentRef.setInput(
      'playerId',
      side === 'player' ? 'player-1' : 'opponent-1',
    );
    fixture.componentRef.setInput('side', side);
    fixture.detectChanges();
  }

  describe('rendering', () => {
    it('should create', () => {
      setInputs([]);
      expect(component).toBeTruthy();
    });

    it('should render all status effects', () => {
      setInputs(mockStatusEffects);
      const items = fixture.debugElement.queryAll(
        By.css('.status-effect-item'),
      );
      expect(items.length).toBe(3);
    });
  });

  describe('icons', () => {
    it('should render icon for each status effect', () => {
      setInputs(mockStatusEffects);
      const icons = fixture.debugElement.queryAll(By.css('app-icon'));
      expect(icons.length).toBe(3);
    });

    it('should derive correct icon name from effect type', () => {
      setInputs([mockStatusEffects[0]]);
      const icon = fixture.debugElement.query(By.css('app-icon'));
      expect(icon.componentInstance.pathD()).toBe(
        ItemConventionRegistry.getStatusEffectDisplay('poison').pathD,
      );
    });
  });

  describe('charges', () => {
    it('should display charges when remainingCharges is present', () => {
      setInputs([mockStatusEffects[0]]);
      const badge = fixture.debugElement.query(By.css('.charges-badge'));
      expect(badge.nativeElement.textContent.trim()).toBe('3');
    });

    it('should not display charges when remainingCharges is null', () => {
      setInputs([mockStatusEffects[1]]);
      expect(fixture.debugElement.query(By.css('.charges-badge'))).toBeFalsy();
    });
  });

  describe('reactivity', () => {
    it('should update when status effects change', () => {
      setInputs([mockStatusEffects[0]]);
      expect(
        fixture.debugElement.queryAll(By.css('.status-effect-item')).length,
      ).toBe(1);

      setInputs(mockStatusEffects);
      expect(
        fixture.debugElement.queryAll(By.css('.status-effect-item')).length,
      ).toBe(3);
    });
  });
});
