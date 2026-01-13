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
        padding: 0.5rem;
        overflow-x: auto;
        width: 100%;
        justify-content: center;
        background: rgba(255, 255, 255, 0.8);
        border-top: 1px solid #ddd;
        border-bottom: 1px solid #ddd;
      }
      .item-wrapper {
        cursor: pointer;
        transition: transform 0.1s;
      }
      .item-wrapper:active {
        transform: scale(0.95);
      }
      .disabled {
        opacity: 0.6;
        cursor: not-allowed;
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
