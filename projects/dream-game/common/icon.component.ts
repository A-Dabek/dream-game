import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="currentColor"
    >
      <path [attr.d]="pathD()" />
    </svg>
  `,
  host: {
    '[style.color]': 'color()',
  },
})
export class IconComponent {
  readonly pathD = input.required<string>();
  readonly color = input('currentColor');
}
