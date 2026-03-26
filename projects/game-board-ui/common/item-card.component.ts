import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ItemId } from '@dream/game-board';
import { ItemConventionRegistry } from '../conventions/convention-registry';
import { IconComponent } from './icon.component';

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
      <app-icon [pathD]="iconPath()" class="item-icon" />
      <h2 class="item-name">{{ displayName() }}</h2>
      <p class="item-description">{{ description() }}</p>
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
    ItemConventionRegistry.getItemDisplay(this.itemId()),
  );

  readonly iconPath = computed(() => this.convention().pathD);
  readonly description = computed(() => this.convention().description);

  readonly displayName = computed(() =>
    ItemConventionRegistry.formatItemIdAsName(this.itemId()),
  );
}
