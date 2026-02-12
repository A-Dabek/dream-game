import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ActionHistoryEntry } from './action-history-entry';
import { IconComponent } from '../common/icon.component';

@Component({
  selector: 'app-action-history',
  standalone: true,
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
          <app-icon [name]="entry.iconName" />
        </div>
      }
    </div>
  `,
})
export class ActionHistoryComponent {
  readonly actions = input.required<ActionHistoryEntry[]>();
  readonly playerId = input.required<string>();
}
