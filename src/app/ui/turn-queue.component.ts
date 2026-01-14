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
        gap: 0.4rem;
        padding: 0.6rem;
        background: #222;
        border-right: 1px solid #333;
        height: 100%;
        overflow: hidden;
      }
      .turn-item {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.2rem;
        height: 2.2rem;
        border-radius: 4px;
        background: #2a2a2a;
        border: 1px solid #444;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .turn-item.player {
        border-color: #4a7c59;
        background: #2d3d32;
      }
      .turn-item.opponent {
        border-color: #a05252;
        background: #3d2d2d;
      }
      .current {
        transform: scale(1.05);
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
        border-width: 2px;
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
