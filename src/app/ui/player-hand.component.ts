import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { Item } from '../item';
import { ItemDisplayComponent } from './item-display.component';

@Component({
  selector: 'app-player-hand',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ItemDisplayComponent],
  template: `
    @for (item of items(); track item.instanceId || item.id) {
      <div
        class="item-wrapper"
        [class.disabled]="!interactive()"
        (click)="interactive() && itemSelected.emit(item)"
      >
        <app-item-display [item]="item" />
      </div>
    }
  `,
})
export class PlayerHandComponent {
  readonly items = input.required<Item[]>();
  readonly interactive = input(true);
  readonly itemSelected = output<Item>();
}
