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
    <style>
      :host {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
        padding: 0.8rem;
        overflow-x: auto;
        width: 100%;
        justify-content: center;
        background: #222;
        border-top: 1px solid #333;
        border-bottom: 1px solid #333;
      }
      .item-wrapper {
        cursor: pointer;
        transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .item-wrapper:active {
        transform: scale(0.92);
      }
      .disabled {
        opacity: 0.5;
        cursor: not-allowed;
        filter: grayscale(0.5);
      }
    </style>
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
