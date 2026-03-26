import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="currentColor"
    >
      <path [attr.d]="pathD()" />
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.25rem;
        --icon-size: 1.6rem;
      }
      svg {
        width: var(--icon-size);
        height: var(--icon-size);
      }
    `,
  ],
  host: {
    '[style.color]': 'color()',
  },
})
export class IconComponent {
  readonly pathD = input.required<string>();
  readonly color = input('currentColor');
  readonly size = input(1.6);
}
