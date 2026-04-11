import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RewardViewComponent } from './reward-view.component';
import { PlayerProgressService } from './player-progress.service';
import { RouterTestingModule } from '@angular/router/testing';
import { vi } from 'vitest';

describe('RewardViewComponent', () => {
  let component: RewardViewComponent;
  let fixture: ComponentFixture<RewardViewComponent>;
  let playerProgress: PlayerProgressService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RewardViewComponent, RouterTestingModule],
      providers: [
        {
          provide: PlayerProgressService,
          useValue: {
            addMatrices: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RewardViewComponent);
    component = fixture.componentInstance;
    playerProgress = TestBed.inject(PlayerProgressService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should claim rewards on init', () => {
    expect(playerProgress.addMatrices).toHaveBeenCalledWith(4);
  });

  it('should display Rewards title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.title')?.textContent).toContain('Rewards');
  });

  it('should display +4 amount', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.amount')?.textContent).toContain('+4');
  });
});
