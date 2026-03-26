import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';
import { Item } from '@dream/game-board';
import { IconComponent } from '@shared-ui';
import { ItemConventionRegistry } from '@dream/game-board-ui';

@Component({
  selector: 'app-item-display',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [IconComponent],
  template: `
    <app-icon [pathD]="pathD()" [color]="color()" />
    <div class="label">{{ label() }}</div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        border: 1px solid var(--color-border);
        border-radius: 4px;
        background: var(--color-surface-1);
        width: var(--hand-item-size);
        height: var(--hand-item-size);
        box-shadow: 0 4px 6px var(--shadow-soft);
        color: var(--color-text-muted);
      }

      :host(.active) {
        border-color: var(--color-accent-active-border);
        background: var(--color-accent-active-bg);
        box-shadow: 0 0 12px var(--shadow-active-item);
      }

      .label {
        font-size: 0.6rem;
        text-align: center;
        margin-top: 0.3rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
        color: var(--color-text-subtle);
        text-transform: capitalize;
      }

      app-icon {
        width: 24px;
        height: 24px;
      }

      :host {
        transition: all 0.2s ease;
      }

      .disable-animations :host {
        transition: none;
      }
    `,
  ],
})
export class ItemDisplayComponent {
  readonly item = input.required<Item>();
  readonly active = input(false);

  readonly pathD = computed(() => {
    try {
      return ItemConventionRegistry.getItemDisplay(this.item().id).pathD;
    } catch {
      return '';
    }
  });

  readonly color = computed(() => {
    const genre = this.item().genre;
    return genre ? `var(--genre-${genre})` : 'currentColor';
  });

  readonly label = computed(() => {
    const id = this.item().id;
    return id.replace('_blueprint_', '').replace(/_/g, ' ');
  });
}
