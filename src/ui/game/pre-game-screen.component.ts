import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { Loadout } from '@dream/item';
import { PlayerHandComponent } from '../board/player-hand.component';

@Component({
  selector: 'app-pre-game-screen',
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
          side="opponent"
        />
      </section>
      <div
        class="headline vs"
        [class.fade-out]="animating()"
        role="img"
        aria-label="versus"
      >
        VS.
      </div>
      <section class="player-section">
        <app-player-hand
          [items]="player().items"
          [interactive]="false"
          class="player-hand"
          [class.show]="animating()"
          side="player"
        />
      </section>
      <section class="actions">
        <button
          class="screen-btn"
          type="button"
          (click)="onReady.emit()"
          aria-label="Ready"
        >
          Ready
        </button>
      </section>
    </div>
  `,
})
export class PreGameScreenComponent {
  readonly player = input.required<Loadout>();
  readonly opponent = input.required<Loadout>();
  readonly animating = signal(true);
  readonly onReady = output<void>();
}
