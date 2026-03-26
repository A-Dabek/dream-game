import { Component, input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      class="btn"
      [class.primary]="variant() === 'primary'"
      [class.secondary]="variant() === 'secondary'"
      [disabled]="disabled()"
    >
      <ng-content></ng-content>
    </button>
  `,
  styles: `
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition:
        background-color 0.2s,
        opacity 0.2s;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .primary {
      background-color: #2196f3;
      color: #fff;

      &:hover:not(:disabled) {
        background-color: #1976d2;
      }
    }

    .secondary {
      background-color: #4a4a4a;
      color: #fff;

      &:hover:not(:disabled) {
        background-color: #5a5a5a;
      }
    }
  `,
})
export class ButtonComponent {
  readonly variant = input<'primary' | 'secondary'>('primary');
  readonly disabled = input(false);
}
