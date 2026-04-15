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
        <h2>Different Icons</h2>
        <div class="icon-grid">
          @for (icon of icons; track icon.id) {
            <div class="icon-item">
              <app-icon
                [iconName]="icon.iconName"
                [color]="icon.color"
                [size]="48"
              />
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
                [iconName]="sampleIconName"
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
              <app-icon [iconName]="sampleIconName" [size]="size" />
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
      id: 1,
      name: 'Police Badge',
      iconName: 'police-badge',
      color: 'currentColor',
    },
    {
      id: 2,
      name: 'Brutal Helm',
      iconName: 'brutal-helm',
      color: 'currentColor',
    },
    {
      id: 3,
      name: 'Fast Forward',
      iconName: 'fast-forward-button',
      color: 'currentColor',
    },
  ] as const;

  sampleIconName = 'check-mark' as const;

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
