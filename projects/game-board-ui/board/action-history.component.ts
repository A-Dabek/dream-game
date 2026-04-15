import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '@shared-ui';
import { ActionHistoryEntry } from './action-history-entry';

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
          <app-icon
            [iconName]="entry.iconName"
            [title]="entry.name"
            [color]="
              entry.genre ? 'var(--genre-' + entry.genre + ')' : 'currentColor'
            "
          />
        </div>
      }
    </div>
  `,
})
export class ActionHistoryComponent {
  readonly actions = input.required<ActionHistoryEntry[]>();
  readonly playerId = input.required<string>();
}
