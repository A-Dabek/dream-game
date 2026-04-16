import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';
import { IconName, Item } from '@dream/shared-basic';
import { IconComponent } from '@shared-ui';

@Component({
  selector: 'app-item-display',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [IconComponent],
  template: `
    @if (usages() > 1) {
      <span class="usages-badge">{{ usages() }}</span>
    }
    <app-icon [iconName]="iconName()" [color]="color()" />
    <div class="label">{{ label() }}</div>
    @if (stats(); as s) {
      <span class="stat-hp">{{ s.hp > 0 ? '+' : '' }}{{ s.hp }}</span>
      <span class="stat-speed">{{ s.speed > 0 ? '+' : '' }}{{ s.speed }}</span>
    }
  `,
  styleUrls: ['./item-display.component.scss'],
  host: {
    '[class.active]': 'active()',
  },
})
export class ItemDisplayComponent {
  readonly item = input.required<Item>();
  readonly iconName = input.required<IconName>();
  readonly label = input.required<string>();
  readonly active = input(false);
  readonly stats = input<{ hp: number; speed: number } | null>(null);

  readonly color = computed(() => {
    const genre = this.item().genre;
    return genre ? `var(--genre-${genre})` : 'currentColor';
  });

  readonly usages = computed(() => this.item().remainingUsages ?? 1);
}
