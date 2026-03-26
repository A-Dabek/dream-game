import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '@shared-ui';
import { StatusEffectDisplayData } from './status-effects-display-data';

@Component({
  selector: 'app-status-effects',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    @let currentSide = side();
    <div
      class="status-effects-container"
      [class.player]="currentSide === 'player'"
      [class.opponent]="currentSide === 'opponent'"
      role="list"
    >
      @for (effect of statusEffects(); track effect.instanceId) {
        <div
          class="status-effect-item"
          [class.player]="currentSide === 'player'"
          [class.opponent]="currentSide === 'opponent'"
          animate.enter="status-effect-enter"
          animate.leave="status-effect-leave"
          role="listitem"
          [attr.aria-label]="effect.type"
        >
          <app-icon
            [pathD]="effect.pathD"
            [color]="
              effect.genre
                ? 'var(--genre-' + effect.genre + ')'
                : 'var(--faction-color)'
            "
          />
          @if (effect.remainingCharges !== null) {
            <div class="charges-badge" aria-hidden="true">
              {{ effect.remainingCharges }}
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class StatusEffectsComponent {
  readonly statusEffects = input.required<StatusEffectDisplayData[]>();
  readonly playerId = input.required<string>();
  readonly side = input.required<'player' | 'opponent'>();
}
