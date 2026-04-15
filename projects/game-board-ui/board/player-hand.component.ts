import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { Item } from '@dream/game-board';
import { ItemDisplayComponent, ItemConventionRegistry } from '../common';
import { IconName } from '@shared-ui';

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
        [attr.data-testid]="'item-' + item.instanceId"
        [attr.data-item-id]="item.id"
        [attr.data-interactive]="interactive()"
      >
        <app-item-display
          [item]="item"
          [iconName]="getIcon(item.id)"
          [label]="getLabel(item.id)"
        />
      </div>
    }
  `,
})
export class PlayerHandComponent {
  readonly items = input.required<Item[]>();
  readonly interactive = input(true);
  readonly side = input<'player' | 'opponent'>('player');
  readonly itemSelected = output<Item>();

  protected getIcon(itemId: string): IconName {
    return ItemConventionRegistry.getItemConvention(itemId).icon as IconName;
  }

  protected getLabel(itemId: string): string {
    return ItemConventionRegistry.getItemConvention(itemId).name;
  }
}
