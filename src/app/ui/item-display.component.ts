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
    <style>
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        border: 1px solid #444;
        border-radius: 4px;
        background: #2a2a2a;
        width: 4rem;
        height: 4rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease;
        color: #ccc;
      }
      .label {
        font-size: 0.6rem;
        text-align: center;
        margin-top: 0.3rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
        color: #aaa;
        text-transform: capitalize;
      }
      :host(.active) {
        border-color: #5c85d6;
        background: #333a4d;
        box-shadow: 0 0 12px rgba(92, 133, 214, 0.4);
      }
    </style>
    <app-icon [name]="iconName()" [size]="2" />
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
