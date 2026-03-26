import { Component } from '@angular/core';
import { IconComponent } from '@shared-ui';

@Component({
  selector: 'app-icon-showcase',
  standalone: true,
  imports: [IconComponent],
  template: `
    <section>
      <h1>Icon Component</h1>

      <section>
        <h2>Different Path Values</h2>
        <div class="icon-grid">
          @for (icon of icons; track icon.pathD) {
            <div class="icon-item">
              <app-icon [pathD]="icon.pathD" [color]="icon.color" [size]="48" />
              <span>{{ icon.name }}</span>
            </div>
          }
        </div>
      </section>

      <section>
        <h2>Color Variations</h2>
        <div class="color-grid">
          @for (color of colors; track color) {
            <div class="color-item" [style.color]="color">
              <app-icon
                pathD="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200z"
                [color]="color"
                [size]="32"
              />
              <span>{{ color }}</span>
            </div>
          }
        </div>
      </section>

      <section>
        <h2>Size Variations</h2>
        <div class="size-grid">
          @for (size of sizes; track size) {
            <div class="size-item">
              <app-icon
                pathD="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200z"
                [size]="size"
              />
              <span>{{ size }}px</span>
            </div>
          }
        </div>
      </section>
    </section>
  `,
  styles: [
    `
      section {
        margin-bottom: 2rem;
      }
      h1 {
        font-size: 2rem;
        margin-bottom: 1.5rem;
      }
      h2 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
        color: #666;
      }
      .icon-grid,
      .color-grid,
      .size-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
      }
      .icon-item,
      .color-item,
      .size-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        border: 1px solid #ddd;
        border-radius: 8px;
      }
      span {
        font-size: 0.875rem;
        color: #666;
      }
    `,
  ],
})
export class IconShowcaseComponent {
  icons = [
    {
      name: 'Checkmark',
      pathD:
        'M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200z',
      color: 'currentColor',
    },
    {
      name: 'Circle',
      pathD:
        'M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200z',
      color: 'currentColor',
    },
    {
      name: 'Star',
      pathD:
        'M288 64L256 128l-32-64c-17.7-35.4-70.7-35.4-88.4 0L91.2 160 16 176c-39.2 8.3-54.9 56-26.5 80l57.6 40.8L32 360c-11.8 34.2 18.6 63 51.6 49.2l68.8-28.4L204 440c17.7 35.4 70.7 35.4 88.4 0l44.4-96.4 57.6-40.8c39.2-8.3 54.9-56 26.5-80l-15.2-63.6 57.6-40.8c33-13.8 39.4-63 18.6-84.8L336 128l-32 64c-17.7 35.4-70.7 35.4-88.4 0z',
      color: 'currentColor',
    },
  ];

  colors = [
    'currentColor',
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ff6600',
    '#990099',
  ];

  sizes = [16, 24, 32, 48, 64];
}
