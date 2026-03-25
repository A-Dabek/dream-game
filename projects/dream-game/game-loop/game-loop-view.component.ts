import { Component, inject, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameLoopStateService } from './game-loop-state.service';
import { StatsBarComponent } from './stats-bar.component';
import { DialogComponent } from '../common/dialog.component';

@Component({
  selector: 'app-game-loop-view',
  standalone: true,
  imports: [RouterOutlet, StatsBarComponent, DialogComponent],
  template: `
    <div class="game-container">
      <app-stats-bar
        [stats]="stateService.playerStats()"
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

  readonly stateService = inject(GameLoopStateService);
  readonly abandonMessage =
    'Are you sure you want to abandon the run? This will reset all progress.';

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
