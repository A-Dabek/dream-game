import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';
import { Genre, Item } from '@dream/item';
import { IconComponent } from './icon.component';
import { ItemDisplayRegistry } from './item-display-map';
import { getGenreColor } from './genre-color.util';

@Component({
  selector: 'app-item-display',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <app-icon [name]="iconName()" [color]="genreColor()" />
    <div class="label">{{ label() }}</div>
  `,
  host: {
    '[class.active]': 'active()',
  },
})
export class ItemDisplayComponent {
  readonly item = input.required<Item>();
  readonly active = input(false);

  readonly iconName = computed(
    () => ItemDisplayRegistry.getMetadata(this.item().id).iconName,
  );

  readonly label = computed(() => {
    const id = this.item().id;
    return id.replace('_blueprint_', '').replace(/_/g, ' ');
  });

  /**
   * Maps the item's genre to its corresponding CSS variable color.
   * Falls back to 'currentColor' if no genre is defined.
   */
  readonly genreColor = computed(() => getGenreColor(this.item().genre));
}
