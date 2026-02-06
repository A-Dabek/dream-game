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
  standalone: true,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      [style.width]="size() + 'rem'"
      [style.height]="size() + 'rem'"
      [style.fill]="color()"
    >
      <path [attr.d]="shape()" />
    </svg>
  `,
})
export class IconComponent {
  readonly name = input('');
  readonly size = input(1);
  readonly color = input('currentColor');

  readonly shape = computed(
    () =>
      (iconCollection as any)[this.name()] ||
      (iconCollection as any)['uncertainty'] ||
      '',
  );
}
