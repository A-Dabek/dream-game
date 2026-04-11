import { Component, inject, ViewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { GameLoopStateService } from './game-loop-state.service';
import { StatsBarComponent, NavButton } from './stats-bar.component';
import { DialogComponent } from '../common/dialog.component';

@Component({
  selector: 'app-game-loop-view',
  standalone: true,
  imports: [RouterOutlet, StatsBarComponent, DialogComponent],
  template: `
    <div class="game-container">
      <app-stats-bar
        [stats]="playerStats()"
        [navButton]="navButton()"
        data-testid="stats-bar"
      />
      <main class="content">
        <router-outlet />
      </main>
    </div>
    <button
      class="abandon-btn"
      data-testid="abandon-btn"
      (click)="openAbandonDialog()"
    >
      Abandon
    </button>
    <app-dialog
      #abandonDialog
      data-testid="abandon-dialog"
      [message]="abandonMessage"
      (confirmed)="onAbandonConfirmed($event)"
    ></app-dialog>
  `,
  styles: `
    :host {
      display: block;
    }

    .game-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .abandon-btn {
      width: 100%;
      padding: 16px;
      background: #f44336;
      color: white;
      border: none;
      font-size: 16px;
      cursor: pointer;
    }

    .abandon-btn:hover {
      background: #d32f2f;
    }
  `,
})
export class GameLoopViewComponent {
  @ViewChild('abandonDialog') private readonly abandonDialog!: DialogComponent;

  private readonly router = inject(Router);
  private readonly stateService = inject(GameLoopStateService);

  readonly playerStats = this.stateService.playerStats;
  readonly abandonMessage =
    'Are you sure you want to abandon the run? This will reset all progress.';

  readonly navButton = (): NavButton | null => {
    const url = this.router.url;
    if (url.includes('/backpack')) {
      return { iconName: 'anvil', text: 'Forge', link: '/game-loop/forge' };
    }
    if (
      url.includes('/forge') ||
      url.includes('/reward') ||
      url === '/game-loop'
    ) {
      return {
        iconName: 'backpack',
        text: 'Backpack',
        link: '/game-loop/backpack',
      };
    }
    return null;
  };

  openAbandonDialog(): void {
    this.abandonDialog.open();
  }

  onAbandonConfirmed(confirmed: boolean): void {
    if (confirmed) {
      this.stateService.resetRun();
      // TODO: Navigate back to main menu
    }
  }
}
