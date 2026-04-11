import { Component, inject, OnInit } from '@angular/core';
import { PlayerProgressService } from './player-progress.service';
import { IconComponent } from '@shared-ui';
import { resolveIcon } from '../common/interface-icon-registry';

@Component({
  selector: 'app-reward-view',
  standalone: true,
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
      gap: 32px;
    }

    .title {
      font-size: 32px;
      margin: 0;
    }

    .currency-line {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 24px;
      font-weight: bold;
    }

    .amount {
      color: #4caf50;
    }
  `,
})
export class RewardViewComponent implements OnInit {
  private readonly playerProgress = inject(PlayerProgressService);
  readonly matrixIconPath = resolveIcon('matrices');

  ngOnInit(): void {
    this.playerProgress.addMatrices(4);
  }
}
