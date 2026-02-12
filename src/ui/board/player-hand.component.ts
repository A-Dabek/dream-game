import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { Item } from '@dream/item';
import { ItemDisplayComponent } from '../common/item-display.component';

@Component({
  selector: 'app-player-hand',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ItemDisplayComponent],
  template: `
    @for (item of items(); track item.instanceId) {
      <div
        class="item-wrapper"
        [class.disabled]="!interactive()"
        (click)="interactive() && itemSelected.emit(item)"
        [animate.leave]="
          side() === 'player' ? 'item-slide-up' : 'item-slide-down'
        "
      >
        <app-item-display [item]="item" />
      </div>
    }
  `,
})
export class PlayerHandComponent {
  readonly items = input.required<Item[]>();
  readonly interactive = input(true);
  readonly side = input<'player' | 'opponent'>('player');
  readonly itemSelected = output<Item>();
}
