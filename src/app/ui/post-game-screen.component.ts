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
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
        background: #1a1a1a;
        color: #e0e0e0;
      }
      .container {
        display: grid;
        grid-template-rows: 1fr auto 1fr auto;
        height: 100%;
        padding: 1rem;
        box-sizing: border-box;
        align-items: center;
        justify-items: center;
      }
      .header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }
      .name {
        margin: 0;
        font-size: 1rem;
        color: #e0e0e0;
      }
      .badge {
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .badge.win {
        background: #2e7d32;
        color: #fff;
      }
      .badge.lose {
        background: #8b2e2e;
        color: #fff;
      }
      .vs {
        opacity: 0.6;
        user-select: none;
      }
      .actions {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
      }
      .restart-btn {
        background: #3b82f6;
        color: #fff;
        border: none;
        padding: 0.9rem 1.4rem;
        border-radius: 0.6rem;
        font-weight: 700;
        cursor: pointer;
      }
      .restart-btn:hover {
        filter: brightness(1.1);
      }
      .restart-btn:focus-visible {
        outline: 3px solid #40c4ff;
        outline-offset: 3px;
      }
    `,
  ],
})
export class PostGameScreenComponent {
  readonly player = input.required<Loadout>();
  readonly opponent = input.required<Loadout>();
  readonly winnerId = input.required<string>();

  readonly playerWon = computed(() => this.winnerId() === 'player');
  readonly opponentWon = computed(() => this.winnerId() === 'cpu');

  readonly restart = output<void>();
}
