import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ItemId } from '@dream/game-board';
import { ItemConventionRegistry } from '../conventions/convention-registry';
import { IconComponent } from '@shared-ui';
import { IconName } from '@shared-ui';

export interface ItemStats {
  hp: number;
  speed: number;
}

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="card-content">
      <div class="item-header">
        <app-icon [iconName]="iconName()" class="item-icon" />
        <div class="item-info">
          <h2 class="item-name">{{ displayName() }}</h2>
          <p class="item-description">{{ description() }}</p>
        </div>
      </div>
      @if (stats(); as itemStats) {
        <div class="item-stats">
          <span class="stat hp">HP: {{ itemStats.hp }}</span>
          <span class="stat speed">Speed: {{ itemStats.speed }}</span>
        </div>
      }
    </div>
  `,
  styleUrls: ['../styles/components/_item-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemCardComponent {
  readonly itemId = input.required<ItemId>();
  readonly stats = input<ItemStats | null>(null);

  readonly convention = computed(() =>
    ItemConventionRegistry.getItemConvention(this.itemId()),
  );

  readonly iconName = computed<IconName>(
    () => this.convention().icon as IconName,
  );
  readonly description = computed(() => this.convention().description);

  readonly displayName = computed(() => this.convention().name);
}
