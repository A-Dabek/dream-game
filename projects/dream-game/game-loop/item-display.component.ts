import { Component, input, computed } from '@angular/core';
import { IconComponent } from '../common/icon.component';
import { Item } from '@dream/game-board';
import { InterfaceIconRegistry } from '../common/interface-icon-registry';

@Component({
  selector: 'app-item-display',
  standalone: true,
  imports: [IconComponent],
  template: `
    <app-icon [pathD]="iconPath()" />
    <span>{{ item().id }}</span>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `,
})
export class ItemDisplayComponent {
  readonly item = input.required<Item>();

  readonly iconPath = computed(() =>
    InterfaceIconRegistry.resolveIconPath('hp'),
  );
}
