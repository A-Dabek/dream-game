import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-turn-queue',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <style>
      :host {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.5rem;
        background: rgba(0, 0, 0, 0.05);
        border-right: 1px solid #ddd;
        height: 100%;
        overflow-y: auto;
      }
      .turn-item {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        background: white;
        border: 2px solid #ccc;
        font-size: 0.8rem;
        font-weight: bold;
        transition: all 0.2s;
      }
      .turn-item.player {
        border-color: #007bff;
        color: #007bff;
      }
      .turn-item.opponent {
        border-color: #dc3545;
        color: #dc3545;
      }
      .current {
        transform: scale(1.1);
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        z-index: 1;
      }
    </style>
    @for (turn of turnQueue(); track $index) {
      <div
        class="turn-item"
        [class.player]="turn === playerId()"
        [class.opponent]="turn !== playerId()"
        [class.current]="$first"
      >
        <app-icon
          [name]="turn === playerId() ? 'police-badge' : 'brutal-helm'"
          [size]="1.5"
        />
      </div>
    }
  `,
})
export class TurnQueueComponent {
  readonly turnQueue = input.required<string[]>();
  readonly playerId = input.required<string>();
}
