import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { TurnEntry } from '@dream/turn-manager';
import { ItemDisplayRegistry } from '../common/item-display-map';
import { IconComponent } from '../common/icon.component';

@Component({
  selector: 'app-turn-queue',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    @for (turn of turnQueue(); track turn.turnId) {
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
            data-testid="skip-turn-button"
          >
            <app-icon [name]="passIconName" />
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
  readonly passIconName = ItemDisplayRegistry.PASS_ICON_NAME;
}
