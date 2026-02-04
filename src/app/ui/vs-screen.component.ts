import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { Loadout } from '@dream/item';
import { PlayerHandComponent } from './player-hand.component';

@Component({
  selector: 'app-vs-screen',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PlayerHandComponent],
  template: `
    <div class="container">
      <section class="opponent-section">
        <app-player-hand
          [items]="opponent().items"
          [interactive]="false"
          class="opponent-hand"
          [class.show]="animating()"
        />
      </section>
      <div
        class="vs"
        [class.fade-out]="animating()"
        role="img"
        aria-label="versus"
      >
        VS
      </div>
      <section class="player-section">
        <app-player-hand
          [items]="player().items"
          [interactive]="false"
          class="player-hand"
          [class.show]="animating()"
        />
      </section>
      <section class="ready-section">
        <button
          class="ready-btn"
          type="button"
          (click)="onReady.emit()"
          aria-label="Ready to fight"
        >
          Ready!
        </button>
      </section>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100vh;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: #1a1a1a;
        box-sizing: border-box;
        font-family: 'Segoe UI', system-ui, sans-serif;
      }
      .container {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        justify-content: space-between;
        align-items: center;
      }
      .opponent-section,
      .player-section {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
      }
      .opponent-hand,
      .player-hand {
        opacity: 0;
        transform: scale(0.5);
        transition:
          opacity 1s ease-out,
          transform 1s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .opponent-hand {
        transform: scale(0.5) translateY(-20px);
        transition-delay: 0.3s;
      }
      .player-hand {
        transform: scale(0.5) translateY(20px);
        transition-delay: 0.6s;
      }
      .opponent-hand.show,
      .player-hand.show {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
      .vs {
        font-size: clamp(3rem, 12vw, 6rem);
        font-weight: 800;
        color: #e0e0e0;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        opacity: 1;
        transform: scale(1);
        transition:
          opacity 0.8s ease-in 1.2s,
          transform 0.8s ease-in 1.2s;
        letter-spacing: 0.1em;
        user-select: none;
      }
      .vs.fade-out {
        opacity: 0;
        transform: scale(0.3);
      }

      .ready-section {
        display: flex;
        justify-content: center;
        padding: 2rem 1rem 1rem;
        width: 100%;
      }

      .ready-btn {
        background: linear-gradient(145deg, #ff6b35, #f7931e);
        color: white;
        border: none;
        padding: 1.5rem 4rem;
        font-size: clamp(1.2rem, 4vw, 1.8rem);
        font-weight: 700;
        border-radius: 50px;
        cursor: pointer;
        box-shadow: 0 8px 20px rgba(255, 107, 53, 0.4);
        transition: all 0.3s ease;
        min-height: 60px;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }

      .ready-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 30px rgba(255, 107, 53, 0.6);
      }

      .ready-btn:focus-visible {
        outline: 3px solid #40c4ff;
        outline-offset: 3px;
      }

      .ready-btn:active {
        transform: translateY(0);
      }
    `,
  ],
})
export class VsScreenComponent {
  readonly player = input.required<Loadout>();
  readonly opponent = input.required<Loadout>();
  readonly animating = signal(true);
  readonly onReady = output<void>();
}
