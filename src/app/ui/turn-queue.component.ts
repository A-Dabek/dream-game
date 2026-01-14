import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
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
        position: relative;
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
      .skip-button {
        position: absolute;
        bottom: -0.2rem;
        right: -0.2rem;
        background: #444;
        border-radius: 50%;
        width: 1rem;
        height: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: 1px solid #666;
        animation: pulse 2s infinite ease-in-out;
        transition: transform 0.1s;
      }
      .skip-button:hover {
        background: #555;
        transform: scale(1.1);
      }
      .skip-button:active {
        transform: scale(0.9);
      }
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 0.8;
        }
        50% {
          transform: scale(1.15);
          opacity: 1;
        }
        100% {
          transform: scale(1);
          opacity: 0.8;
        }
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
        @if ($first && turn === playerId()) {
          <div
            class="skip-button"
            (click)="skipTurn.emit()"
            role="button"
            aria-label="Skip Turn"
            tabindex="0"
            (keydown.enter)="skipTurn.emit()"
            (keydown.space)="$event.preventDefault(); skipTurn.emit()"
          >
            <app-icon name="fast-forward-button" [size]="0.6" />
          </div>
        }
      </div>
    }
  `,
})
export class TurnQueueComponent {
  readonly turnQueue = input.required<string[]>();
  readonly playerId = input.required<string>();
  readonly skipTurn = output<void>();
}
