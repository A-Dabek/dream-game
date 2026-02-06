import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-turn-queue',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    @for (turn of turnQueue(); track $index) {
      <div
        class="turn-item"
        [class.player]="turn === playerId()"
        [class.opponent]="turn !== playerId()"
        [class.current]="$first"
      >
        <app-icon
          [name]="turn === playerId() ? 'police-badge' : 'brutal-helm'"
        />
        @if ($first && turn === playerId()) {
          <div
            class="skip-button"
            (click)="skipTurn.emit()"
            role="button"
            aria-label="Skip Turn"
            tabindex="0"
            (keydown.enter)="skipTurn.emit()"
            (keydown.space)="$event.preventDefault(); skipTurn.emit()"
          >
            <app-icon name="fast-forward-button" />
          </div>
        }
      </div>
    }
  `,
})
export class TurnQueueComponent {
  readonly turnQueue = input.required<string[]>();
  readonly playerId = input.required<string>();
  readonly skipTurn = output<void>();
}
