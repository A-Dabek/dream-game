import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';
import { Item } from '../item';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-item-display',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <app-icon [name]="iconName()" />
    <div class="label">{{ label() }}</div>
  `,
  host: {
    '[class.active]': 'active()',
  },
})
export class ItemDisplayComponent {
  readonly item = input.required<Item>();
  readonly active = input(false);

  readonly iconName = computed(() => {
    const id = this.item().id;
    // Strip _blueprint_ prefix for icon lookup if it exists, or handle specific mappings
    if (id.startsWith('_blueprint_')) {
      return id.replace('_blueprint_', '').replace(/_/g, '-');
    }
    return id.replace(/_/g, '-');
  });

  readonly label = computed(() => {
    const id = this.item().id;
    return id.replace('_blueprint_', '').replace(/_/g, ' ');
  });
}
