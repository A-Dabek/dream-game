import { Component, input, computed } from '@angular/core';
import { IconComponent } from '../common/icon.component';
import { Item } from '@dream/game-board';
import { ItemConventionRegistry } from '@dream/game-board-ui';

@Component({
  selector: 'app-item-display',
  standalone: true,
  imports: [IconComponent],
  template: `
    <app-icon [pathD]="iconPath()" />
    <span class="item-name">{{ displayName() }}</span>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      text-align: center;
      padding: 0.25rem;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }

    .item-name {
      font-size: 0.65rem;
      line-height: 1.1;
      word-break: break-word;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    app-icon {
      width: 24px;
      height: 24px;
    }
  `,
})
export class ItemDisplayComponent {
  readonly item = input.required<Item>();

  readonly iconPath = computed(() => {
    try {
      return ItemConventionRegistry.getItemDisplay(this.item().id).pathD;
    } catch {
      return '';
    }
  });

  readonly displayName = computed(() =>
    ItemConventionRegistry.formatItemIdAsName(this.item().id),
  );
}
