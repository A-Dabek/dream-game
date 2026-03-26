import { Component, computed, input, InputSignal } from '@angular/core';
import { IconComponent } from '@shared-ui';
import {
  InterfaceIconRegistry,
  InterfaceIconName,
} from './interface-icon-registry';

@Component({
  selector: 'app-icon-text',
  standalone: true,
  imports: [IconComponent],
  template: `
    <app-icon [pathD]="pathD()" [color]="color()"></app-icon>
    <span>{{ text() }}</span>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `,
})
export class IconTextComponent {
  readonly iconName: InputSignal<InterfaceIconName> = input.required();
  readonly text: InputSignal<string> = input.required();
  readonly color: InputSignal<string> = input('currentColor');

  readonly pathD = computed(() =>
    InterfaceIconRegistry.resolveIconPath(this.iconName()),
  );
}
