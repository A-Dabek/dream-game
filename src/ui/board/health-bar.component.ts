import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

@Component({
  selector: 'app-health-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="center-content">
      <div class="health-bar-container">
        <div class="health-bar">
          <div
            class="health-fill"
            [class.player-health]="variant() === 'player'"
            [class.opponent-health]="variant() === 'opponent'"
            [style.width.%]="healthPercent()"
          ></div>
          <span class="health-text">{{ health() }}</span>
        </div>
      </div>
    </div>
  `,
})
export class HealthBarComponent {
  readonly health = input.required<number>();
  readonly maxHealth = input(100);
  readonly variant = input<'player' | 'opponent'>('player');

  readonly healthPercent = computed(() =>
    Math.max(0, Math.min(100, (this.health() / this.maxHealth()) * 100)),
  );
}
