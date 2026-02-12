import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';
import { Item } from '@dream/item';
import { IconComponent } from './icon.component';
import { iconNameFromItemId } from './icon-name.util';

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

  readonly iconName = computed(() => iconNameFromItemId(this.item().id));

  readonly label = computed(() => {
    const id = this.item().id;
    return id.replace('_blueprint_', '').replace(/_/g, ' ');
  });
}
