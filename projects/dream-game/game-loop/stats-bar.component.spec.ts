import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { StatsBarComponent, NavButton } from './stats-bar.component';
import { IconTextComponent } from '../common/icon-text.component';
import { PlayerStats } from './game-loop-state.service';

describe('StatsBarComponent', () => {
  let component: StatsBarComponent;
  let fixture: ComponentFixture<StatsBarComponent>;

  const mockStats: PlayerStats = {
    hp: 10,
    speed: 5,
    matrices: 8,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsBarComponent, IconTextComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsBarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display stats values', () => {
    fixture.componentRef.setInput('stats', mockStats);
    fixture.detectChanges();

    const matricesEl = fixture.nativeElement.querySelector(
      '[data-testid="stat-matrices"]',
    );
    const hpEl = fixture.nativeElement.querySelector('[data-testid="stat-hp"]');
    const speedEl = fixture.nativeElement.querySelector(
      '[data-testid="stat-speed"]',
    );

    expect(matricesEl.textContent).toContain('8');
    expect(hpEl.textContent).toContain('10');
    expect(speedEl.textContent).toContain('5');
  });

  it('should not show nav button when navButton is null', () => {
    fixture.componentRef.setInput('stats', mockStats);
    fixture.componentRef.setInput('navButton', null);
    fixture.detectChanges();

    const navBtn = fixture.nativeElement.querySelector(
      '[data-testid="nav-btn"]',
    );
    expect(navBtn).toBeNull();
  });

  it('should show nav button with correct text and link', () => {
    const navButton: NavButton = {
      iconName: 'backpack',
      text: 'Backpack',
      link: '/game-loop/backpack',
    };

    fixture.componentRef.setInput('stats', mockStats);
    fixture.componentRef.setInput('navButton', navButton);
    fixture.detectChanges();

    const navBtn = fixture.nativeElement.querySelector(
      '[data-testid="nav-btn"]',
    );
    expect(navBtn).toBeTruthy();
    expect(navBtn.textContent).toContain('Backpack');
    expect(navBtn.getAttribute('href')).toContain('/game-loop/backpack');
  });
});
