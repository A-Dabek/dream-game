import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StatusEffectDisplayData } from '@dream/game-board';
import { IconComponent } from '../common/icon.component';
import { ItemConventionRegistry } from '../conventions/convention-registry';

@Component({
  selector: 'app-status-effects',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div
      class="status-effects-container"
      [class.player]="side() === 'player'"
      [class.opponent]="side() === 'opponent'"
      role="list"
    >
      @for (effect of statusEffects(); track effect.instanceId) {
        <div
          class="status-effect-item"
          [class.player]="side() === 'player'"
          [class.opponent]="side() === 'opponent'"
          animate.enter="status-effect-enter"
          animate.leave="status-effect-leave"
          role="listitem"
          [attr.aria-label]="effect.type"
        >
          <app-icon
            [pathD]="getPathD(effect.type)"
            [color]="'var(--faction-color)'"
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

  getPathD(type: string): string {
    return ItemConventionRegistry.getStatusEffectDisplay(type as any).pathD;
  }
}
