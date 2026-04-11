import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { Loadout } from '@dream/game-board';
import { PlayerHandComponent } from '../board/player-hand.component';

@Component({
  selector: 'app-post-game-screen',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PlayerHandComponent],
  template: `
    <div class="container" role="region" aria-label="Game result">
      <section class="opponent-section">
        <div class="headline" aria-live="polite">
          {{ opponentWon() ? 'Winner' : 'Loser' }}
        </div>
        <app-player-hand
          [items]="opponent().items"
          [interactive]="false"
          side="opponent"
        />
      </section>

      <section class="player-section">
        <div class="headline" aria-live="polite">
          {{ playerWon() ? 'Winner' : 'Loser' }}
        </div>
        <app-player-hand
          [items]="player().items"
          [interactive]="false"
          side="player"
        />
      </section>

      <section class="actions">
        <button
          type="button"
          class="screen-btn"
          (click)="continue.emit(playerWon())"
          data-testid="continue-button"
        >
          Continue
        </button>
      </section>
    </div>
  `,
})
export class PostGameScreenComponent {
  readonly player = input.required<Loadout>();
  readonly opponent = input.required<Loadout>();
  readonly winner = input.required<'player' | 'opponent'>();

  readonly playerWon = computed(() => this.winner() === 'player');
  readonly opponentWon = computed(() => this.winner() === 'opponent');

  readonly continue = output<boolean>();
}
