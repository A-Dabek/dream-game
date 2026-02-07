import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { IconComponent } from './icon.component';
import { TurnEntry } from '@dream/turn-manager';

/**
 * Displays the upcoming turns with their stable IDs provided by TurnManager.
 */
@Component({
  selector: 'app-turn-queue',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    @for (turn of turnItems(); track turn.id) {
      <div
        class="turn-item"
        [class.player]="turn.playerId === playerId()"
        [class.opponent]="turn.playerId !== playerId()"
        [class.current]="$first"
        animate.leave="turn-slide-out"
      >
        <app-icon
          [name]="turn.playerId === playerId() ? 'police-badge' : 'brutal-helm'"
        />
        @if ($first && turn.playerId === playerId()) {
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
  readonly turnQueue = input.required<TurnEntry[]>();
  readonly playerId = input.required<string>();
  readonly skipTurn = output<void>();

  readonly turnItems = computed(() => this.turnQueue());
}
