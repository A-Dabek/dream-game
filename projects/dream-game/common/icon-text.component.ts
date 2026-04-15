import { Component, input, InputSignal } from '@angular/core';
import { IconComponent } from '@shared-ui';
import { IconName } from '@shared-ui';

@Component({
  selector: 'app-icon-text',
  standalone: true,
  imports: [IconComponent],
  template: `
    <app-icon [iconName]="iconName()" [color]="color()"></app-icon>
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
  readonly iconName = input.required<IconName>();
  readonly text = input.required<string>();
  readonly color: InputSignal<string> = input('currentColor');
}
