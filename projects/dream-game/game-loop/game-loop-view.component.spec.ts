import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterOutlet } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { GameLoopViewComponent } from './game-loop-view.component';
import { StatsBarComponent } from './stats-bar.component';
import { DialogComponent } from '../common/dialog.component';
import { GameLoopStateService } from './game-loop-state.service';

describe('GameLoopViewComponent', () => {
  let component: GameLoopViewComponent;
  let fixture: ComponentFixture<GameLoopViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        GameLoopViewComponent,
        StatsBarComponent,
        DialogComponent,
        RouterOutlet,
      ],
      providers: [GameLoopStateService],
    }).compileComponents();

    fixture = TestBed.createComponent(GameLoopViewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pass stats to stats-bar', () => {
    fixture.detectChanges();

    const statsBar = fixture.nativeElement.querySelector('app-stats-bar');
    expect(statsBar).toBeTruthy();
  });

  it('should show abandon button', () => {
    fixture.detectChanges();

    const abandonBtn = fixture.nativeElement.querySelector(
      '[data-testid="abandon-btn"]',
    );
    expect(abandonBtn).toBeTruthy();
    expect(abandonBtn.textContent).toContain('Abandon');
  });
});
