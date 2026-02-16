import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { Loadout } from '@dream/item';
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
          (click)="restart.emit()"
          aria-label="Start a new game"
          data-testid="new-game-button"
        >
          New Game
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
