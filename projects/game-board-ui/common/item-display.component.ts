import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';
import { Item } from '@dream/game-board';
import { IconComponent } from './icon.component';
import { ItemConventionRegistry } from '../conventions/convention-registry';

@Component({
  selector: 'app-item-display',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <app-icon
      [pathD]="pathD()"
      [color]="
        item().genre ? 'var(--genre-' + item().genre + ')' : 'currentColor'
      "
    />
    <div class="label">{{ label() }}</div>
  `,
  host: {
    '[class.active]': 'active()',
  },
})
export class ItemDisplayComponent {
  readonly item = input.required<Item>();
  readonly active = input(false);

  readonly pathD = computed(
    () => ItemConventionRegistry.getItemDisplay(this.item().id).pathD,
  );

  readonly label = computed(() => {
    const id = this.item().id;
    return id.replace('_blueprint_', '').replace(/_/g, ' ');
  });
}
