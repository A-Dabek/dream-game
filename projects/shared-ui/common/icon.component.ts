import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

// IMPORTANT: Do NOT open or read the entire icons.json during development/review!
// It is over 5MB big. We import it here only to look up paths by icon name.
import iconsJson from '../../../assets/icons.json';
import { IconName } from './icon-name';

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
      @if (title()) {
        <title>{{ title() }}</title>
      }
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
  readonly iconName = input.required<IconName>();
  readonly title = input<string | null>(null);

  readonly pathD = computed(() => {
    const name = this.iconName();
    const d = (iconsJson as Record<string, string>)[name];
    return d ?? '';
  });

  readonly color = input('currentColor');
  readonly size = input(1.6);
}
