import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { GameLoopStateService } from './game-loop-state.service';
import { IconComponent } from '@shared-ui';
import { resolveIcon } from '../common/interface-icon-registry';

@Component({
  selector: 'app-reward-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <main class="reward-container" data-testid="reward-view">
      <h1 class="title">Rewards</h1>
      <div class="currency-line">
        <app-icon [pathD]="matrixIconPath" />
        <span class="amount">+4</span>
      </div>
    </main>
  `,
  styles: `
    .reward-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      gap: 2rem;
    }

    .title {
      font-size: 2rem;
      margin: 0;
    }

    .currency-line {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 1.5rem;
      font-weight: bold;
    }

    .amount {
      color: var(--color-player);
    }
  `,
})
export class RewardViewComponent implements OnInit {
  private readonly service = inject(GameLoopStateService);
  readonly matrixIconPath = resolveIcon('matrices');

  ngOnInit(): void {
    this.service.addReward(4);
  }
}
