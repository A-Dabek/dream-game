import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { Loadout } from '@dream/item';
import { PlayerHandComponent } from './player-hand.component';

@Component({
  selector: 'app-post-game-screen',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PlayerHandComponent],
  template: `
    <div class="container" role="region" aria-label="Game result">
      <section class="opponent-section">
        <div class="header" aria-live="polite">
          <h2 class="name">Opponent</h2>
          <span
            class="badge"
            [class.win]="opponentWon()"
            [class.lose]="!opponentWon()"
          >
            {{ opponentWon() ? 'Won' : 'Lost' }}
          </span>
        </div>
        <app-player-hand [items]="opponent().items" [interactive]="false" />
      </section>

      <div class="vs" role="img" aria-label="game result separator">•</div>

      <section class="player-section">
        <div class="header" aria-live="polite">
          <h2 class="name">You</h2>
          <span
            class="badge"
            [class.win]="playerWon()"
            [class.lose]="!playerWon()"
          >
            {{ playerWon() ? 'Won' : 'Lost' }}
          </span>
        </div>
        <app-player-hand [items]="player().items" [interactive]="false" />
      </section>

      <section class="actions">
        <button
          type="button"
          class="restart-btn"
          (click)="restart.emit()"
          aria-label="Play again"
        >
          Play again
        </button>
      </section>
    </div>
  `,
})
export class PostGameScreenComponent {
  readonly player = input.required<Loadout>();
  readonly opponent = input.required<Loadout>();
  readonly winnerId = input.required<string>();

  readonly playerWon = computed(() => this.winnerId() === 'player');
  readonly opponentWon = computed(() => this.winnerId() === 'cpu');

  readonly restart = output<void>();
}
