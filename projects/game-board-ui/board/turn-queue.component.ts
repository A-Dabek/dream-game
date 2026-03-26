import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { TurnEntry } from '@dream/game-board';
import { ItemConventionRegistry } from '../common';
import { IconComponent } from '@shared-ui';

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
        <app-icon [pathD]="getPathD(turn.playerId)" />
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
            <app-icon [pathD]="passIconPath" />
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
  readonly passIconPath = ItemConventionRegistry.PASS_ICON_PATH;

  getPathD(playerId: string): string {
    const iconName =
      playerId === this.playerId() ? 'police-badge' : 'brutal-helm';
    return ItemConventionRegistry.resolveIconPath(iconName);
  }
}
