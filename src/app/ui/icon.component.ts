import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';
import iconCollection from '../../../assets/icons.json';

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="currentColor"
    >
      <path [attr.d]="shape()" />
    </svg>
  `,
  host: {
    '[style.color]': 'color()',
  },
})
export class IconComponent {
  readonly name = input('');
  readonly color = input('currentColor');

  readonly shape = computed(
    () =>
      (iconCollection as any)[this.name()] ||
      (iconCollection as any)['uncertainty'] ||
      '',
  );
}
