import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Genre } from '@dream/game-board';
import { ActionHistoryEntry } from './action-history-entry';
import { IconComponent } from '../common/icon.component';
import { getGenreColor } from '../common/genre-color.util';

@Component({
  selector: 'app-action-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="history-list" role="log" aria-label="Recent actions">
      @for (entry of actions(); track entry.id) {
        <div
          class="history-item"
          [class.player]="entry.playerId === playerId()"
          [class.opponent]="entry.playerId !== playerId()"
          animate.enter="history-slide-in"
        >
          <app-icon [name]="entry.iconName" [color]="getColor(entry.genre)" />
        </div>
      }
    </div>
  `,
})
export class ActionHistoryComponent {
  readonly actions = input.required<ActionHistoryEntry[]>();
  readonly playerId = input.required<string>();

  getColor(genre: Genre | undefined): string {
    return getGenreColor(genre);
  }
}
